CREATE TYPE "public"."diddl_type" AS ENUM('sticker', 'A7', 'A6', 'A5', 'A4', 'series', 'gift-paper', 'birthday', 'special', 'game', 'A2', 'paper-relief', 'post-it', 'rectangular-memo', 'square-memo', 'quardiddl-card', 'letter-paper', 'stamp', 'paper-bag-A5', 'paper-bag-A4', 'paper-bag-expo', 'bag-small', 'bag-large', 'bag-mega', 'bag-plastic', 'postal-card', 'towel');--> statement-breakpoint
CREATE TABLE "diddls" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "diddl_type" NOT NULL,
	"image_path" text NOT NULL,
	"image_width" integer,
	"image_height" integer
);
--> statement-breakpoint
CREATE TABLE "list_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "list_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"list_id" integer NOT NULL,
	"diddl_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"is_damaged" boolean DEFAULT false NOT NULL,
	"is_incomplete" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "list_sections" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "list_sections_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"position" integer NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lists" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "lists_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"section_id" integer NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"birthdate" date,
	"description" text DEFAULT '' NOT NULL,
	"hobbies" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_list_id_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_diddl_id_diddls_id_fk" FOREIGN KEY ("diddl_id") REFERENCES "public"."diddls"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lists" ADD CONSTRAINT "lists_section_id_list_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."list_sections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "list_sections_user_id_name_active_idx" ON "list_sections" USING btree ("user_id",lower("name")) WHERE "list_sections"."deleted_at" is null;