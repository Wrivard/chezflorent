import assert from "node:assert/strict";
import { test } from "node:test";
import { EVENT_RESERVATIONS, getEventReservation } from "./eventReservation.ts";

for (const title of [
  "Quiz", "QUIZ CONNAISSANCES GÉNÉRALES", "Quiz connaissances générales",
  "Quiz 19h30", "Quiz musicale 19h30", "Soirée quiz — Halloween (19h30)",
  "Quiz: édition cinéma", "« quiz »", "Quiz–Halloween", "ＱＵＩＺ 19h30",
]) {
  test(`Quiz title: ${title}`, () => {
    assert.equal(getEventReservation({ title }), EVENT_RESERVATIONS.quiz);
  });
}

for (const title of [
  "Hitster", "Hitster Live Band ", "HITSTER LIVE BAND 2000'S HITS",
  "Hitster Rock ", "Soirée HITSTER – 19h30", "(Hitster) Halloween",
]) {
  test(`Hitster title: ${title}`, () => {
    assert.equal(getEventReservation({ title }), EVENT_RESERVATIONS.hitster);
  });
}

for (const title of [
  "", "Boozie Bingo", "Atelier vins rouges 19h00", "Soir de match Hockey",
  "Diffusion film d'horreur 19h30", "Quizmaster", "préquiz", "Quizé",
  "Quiz\u0301", "Quiz123", "Quiz_master", "antiHitster", "Hitsters",
  "Hitster2000", "Hitster_rock", "Hitsteré", "Quiz et Hitster",
  "HITSTER / QUIZ",
]) {
  test(`No automatic form: ${title}`, () => {
    assert.equal(getEventReservation({ title }), null);
  });
}

test("Only the title determines the form, not the tag or description", () => {
  const event = {
    title: "Quiz musicale 19h30",
    tag: "Spooky Hitster",
    description: "Hitster",
  };
  assert.equal(getEventReservation(event), EVENT_RESERVATIONS.quiz);
  assert.equal(getEventReservation({ ...event, title: "Boozie Bingo", tag: "Quiz" }), null);
});

for (const title of ["Quiz", "Hitster", "Quiz et Hitster"]) {
  test(`Closed/sold-out event: ${title}`, () => {
    assert.equal(getEventReservation({ title, soldOut: true }), null);
    assert.equal(getEventReservation({ title, closed: true }), null);
  });
}