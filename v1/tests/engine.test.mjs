import test from "node:test";
import assert from "node:assert/strict";
import {
  ipv4,
  cidr,
  contains,
  simulate,
  defaultConfig,
  grade,
  sanitizeProgress,
  emptyProgress,
} from "../src/engine.js";
import { courses, sources } from "../src/content.js";
test("IPv4 strict: refuses invalid or ambiguous octets", () => {
  assert.equal(ipv4("255.255.255.255"), 4294967295);
  for (const a of ["256.1.1.1", "1.1.1", "01.2.3.4", "1.2.3.-1", "<script>"])
    assert.throws(() => ipv4(a));
});
test("CIDR /0, /24 and /32 and unsigned addresses", () => {
  assert.ok(contains("0.0.0.0/0", "255.255.255.255"));
  assert.ok(contains("198.51.100.0/24", "198.51.100.20"));
  assert.ok(!contains("10.0.0.1/32", "10.0.0.2"));
  assert.throws(() => cidr("10.0.0.0/33"));
  assert.throws(() => cidr("10.0.0.0/-1"));
});
test("HTTPS allowed with source translation", () => {
  const r = simulate(defaultConfig());
  assert.equal(r.verdict, "accept");
  assert.equal(r.policy.id, 10);
  assert.equal(r.translated, "203.0.113.2");
  assert.equal(r.steps.length, 5);
});
test("more specific route wins even with higher distance", () => {
  const c = defaultConfig();
  c.packet.dst = "10.10.20.10";
  c.routes[0].distance = 200;
  const r = simulate(c);
  assert.equal(r.route.outgoing, "dmz");
  assert.equal(r.policy.id, 20);
  assert.equal(r.translated, c.packet.src);
});
test("equal prefixes prefer lower distance", () => {
  const c = defaultConfig();
  c.routes.push({
    network: "0.0.0.0/0",
    outgoing: "dmz",
    distance: 5,
    enabled: true,
  });
  assert.equal(simulate(c).route.outgoing, "dmz");
});
test("disabled route is not selected", () => {
  const c = defaultConfig();
  c.routes[1].enabled = false;
  assert.equal(simulate(c).verdict, "no-route");
});
test("policy order: broad deny masks precise allow", () => {
  const c = defaultConfig();
  c.policies.unshift(c.policies.pop());
  const r = simulate(c);
  assert.equal(r.verdict, "explicit-deny");
  assert.equal(r.policy.id, 30);
  assert.equal(r.steps.length, 3);
});
test("no matching policy means implicit deny", () => {
  const c = defaultConfig();
  c.packet.port = 22;
  c.policies.pop();
  assert.equal(simulate(c).verdict, "implicit-deny");
});
test("disabled allow falls through to explicit deny", () => {
  const c = defaultConfig();
  c.policies[0].enabled = false;
  assert.equal(simulate(c).verdict, "explicit-deny");
});
test("source CIDR matters", () => {
  const c = defaultConfig();
  c.packet.src = "10.99.0.1";
  assert.equal(simulate(c).verdict, "explicit-deny");
});
test("destination CIDR matters", () => {
  const c = defaultConfig();
  c.policies[0].destination = "192.0.2.0/24";
  assert.equal(simulate(c).verdict, "explicit-deny");
});
test("egress and ingress interfaces matter", () => {
  const c = defaultConfig();
  c.packet.incoming = "dmz";
  assert.equal(simulate(c).verdict, "explicit-deny");
});
test("TCP 443 is not UDP 443", () => {
  const c = defaultConfig();
  c.packet.protocol = "UDP";
  assert.equal(simulate(c).verdict, "explicit-deny");
});
test("SNAT disabled is not an automatic deny", () => {
  const c = defaultConfig();
  c.policies[0].nat = false;
  const r = simulate(c);
  assert.equal(r.verdict, "accept");
  assert.equal(r.translated, c.packet.src);
});
test("ICMP ignores transport ports only when protocol matches", () => {
  const c = defaultConfig();
  c.packet.protocol = "ICMP";
  assert.equal(simulate(c).verdict, "explicit-deny");
  c.policies[0].protocol = "ICMP";
  c.packet.port = 0;
  assert.equal(simulate(c).verdict, "accept");
});
test("invalid input produces explicit validation error", () => {
  for (const port of [0, 65536, NaN, 3.2]) {
    const c = defaultConfig();
    c.packet.port = port;
    assert.throws(() => simulate(c));
  }
  const c = defaultConfig();
  c.routes[0].network = "broken";
  assert.throws(() => simulate(c));
});
test("empty routes and empty policies", () => {
  const c = defaultConfig();
  c.routes = [];
  assert.equal(simulate(c).verdict, "no-route");
  c.routes = defaultConfig().routes;
  c.policies = [];
  assert.equal(simulate(c).verdict, "implicit-deny");
});
test("quiz grading distinguishes missing, wrong and correct", () => {
  const qs = courses[0].quiz;
  const g = grade(qs, ["1", "0", ""]);
  assert.equal(g.correct, 1);
  assert.equal(g.missing, 1);
  assert.deepEqual(g.results, ["correct", "incorrect", "missing"]);
});
test("all answer keys pass; grading is repeatable", () => {
  for (const c of courses) {
    const answers = c.quiz.map((q) =>
      q.type === "choice" ? q.answer : q.answers[0],
    );
    assert.equal(grade(c.quiz, answers).correct, c.quiz.length);
    assert.deepEqual(grade(c.quiz, answers), grade(c.quiz, answers));
  }
});
test("progress import validates scores and limits notes", () => {
  const id = courses[0].slug;
  const raw = {
    ...emptyProgress(),
    read: { [id]: true, evil: true },
    scores: { [id]: { correct: 99, total: 3 } },
    notes: { [id]: "x".repeat(6000) },
    last: "unknown",
  };
  const p = sanitizeProgress(raw, courses);
  assert.equal(Object.keys(p.read).length, 1);
  assert.equal(Object.keys(p.scores).length, 0);
  assert.equal(p.notes[id].length, 5000);
  assert.equal(p.last, null);
  assert.throws(() => sanitizeProgress({ version: 99 }, courses));
  assert.throws(() => sanitizeProgress(null, courses));
});
test("content is complete and references resolve", () => {
  assert.equal(courses.length, 8);
  assert.equal(new Set(courses.map((c) => c.slug)).size, 8);
  for (const c of courses) {
    assert.equal(c.lessons.length, 3);
    assert.equal(c.quiz.length, 3);
    assert.ok(c.lessons.every((l) => l[1].length > 200));
    for (const key of c.refs) assert.ok(sources[key]);
    assert.ok(c.exercise.length >= 3);
  }
});
