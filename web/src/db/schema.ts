import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { RollResult } from "@/lib/dice";
import type { CharacterBuild } from "@/rules/build";
import type { AbilityMethod } from "@/rules/core";

// Rollen in einer Kampagne (siehe KONZEPT.md, Abschnitt "Rollen und Geheimnisse")
export const memberRole = pgEnum("member_role", ["gm", "cogm", "player"]);
// Live-Szene (alle gleichzeitig) oder Async-Szene (zwischen den Spielabenden)
export const sceneMode = pgEnum("scene_mode", ["live", "async"]);
// Wer eine Szene sehen darf: alle Mitglieder oder nur ausgewählte Teilnehmer
export const sceneVisibility = pgEnum("scene_visibility", ["all", "restricted"]);
// Wer einen Post sehen darf: alle, nur Spielleitung (Notiz) oder geflüstert an eine Person
export const postVisibility = pgEnum("post_visibility", ["all", "gm", "whisper"]);

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).defaultNow().notNull();

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: createdAt(),
});

export const sessions = pgTable("sessions", {
  // SHA-256 des Session-Tokens; das Token selbst liegt nur im Cookie
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  // Erlaubte Wege, Attributswerte zu bestimmen (legt die Spielleitung fest)
  abilityMethods: jsonb("ability_methods").$type<AbilityMethod[]>().notNull().default(["standard", "pointbuy", "roll"]),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: createdAt(),
});

export const campaignMembers = pgTable(
  "campaign_members",
  {
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: memberRole("role").notNull().default("player"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.campaignId, t.userId] })],
);

export const invites = pgTable("invites", {
  token: text("token").primaryKey(),
  campaignId: uuid("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  role: memberRole("role").notNull().default("player"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: createdAt(),
});

export const scenes = pgTable(
  "scenes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    mode: sceneMode("mode").notNull().default("async"),
    visibility: sceneVisibility("visibility").notNull().default("all"),
    createdAt: createdAt(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
  },
  (t) => [index("scenes_campaign_idx").on(t.campaignId)],
);

// Teilnehmer einer Szene mit visibility = "restricted"
export const sceneParticipants = pgTable(
  "scene_participants",
  {
    sceneId: uuid("scene_id")
      .notNull()
      .references(() => scenes.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.sceneId, t.userId] })],
);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sceneId: uuid("scene_id")
      .notNull()
      .references(() => scenes.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    // Post der Spielleitung (wird hervorgehoben dargestellt)
    asGm: boolean("as_gm").notNull().default(false),
    // Optional: Name eines NSC, als der die Spielleitung spricht
    speaker: text("speaker"),
    body: text("body").notNull().default(""),
    visibility: postVisibility("visibility").notNull().default("all"),
    whisperTo: uuid("whisper_to").references(() => users.id),
    roll: jsonb("roll").$type<RollResult>(),
    // Was gewürfelt wurde, z. B. "Heimlichkeit" (bei Würfen vom Charakterbogen)
    rollLabel: text("roll_label"),
    // Optional: Charakter, als der gepostet wurde
    characterId: uuid("character_id").references(() => characters.id, { onDelete: "set null" }),
    // Verdeckter Wurf: Spieler sehen nur, dass gewürfelt wurde
    rollHidden: boolean("roll_hidden").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("posts_scene_created_idx").on(t.sceneId, t.createdAt)],
);

// Charaktere: gespeichert wird nur die Auswahl (build), alle Werte werden daraus berechnet
export const characters = pgTable(
  "characters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    level: integer("level").notNull().default(1),
    build: jsonb("build").$type<CharacterBuild>().notNull(),
    hpCurrent: integer("hp_current").notNull(),
    hpTemp: integer("hp_temp").notNull().default(0),
    appearance: text("appearance").notNull().default(""),
    backstory: text("backstory").notNull().default(""),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("characters_campaign_idx").on(t.campaignId)],
);

// Gewürfelte Attributswerte (4W6) – serverseitig, damit niemand beliebig oft neu würfelt, ohne dass es auffällt
export const abilityRolls = pgTable("ability_rolls", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  values: jsonb("values").$type<number[]>().notNull(),
  details: jsonb("details").$type<number[][]>().notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: createdAt(),
});

// Warteliste für den öffentlichen Start. Gespeichert wird nur, was für die Benachrichtigung nötig ist.
export const waitlist = pgTable("waitlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  // Rolle, die jemand am Tisch meistens hat – hilft bei der Planung (optional)
  role: text("role"),
  // Zeitpunkt der Einwilligung (Häkchen im Formular)
  consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
  // Geheimer Link zum Austragen, steht später in jeder Mail
  unsubscribeToken: text("unsubscribe_token").notNull().unique(),
  // Bestätigung per Mail (Double-Opt-in) – kommt, sobald Erzählfeuer Mails verschicken kann
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  createdAt: createdAt(),
});

export type User = typeof users.$inferSelect;
export type Character = typeof characters.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type Scene = typeof scenes.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type MemberRole = (typeof memberRole.enumValues)[number];
