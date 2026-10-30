CREATE TABLE "barcode_groups" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "barcodes" (
	"item" uuid NOT NULL,
	"barcode_group" uuid NOT NULL,
	"barcode" varchar NOT NULL,
	CONSTRAINT "barcodes_pkey" PRIMARY KEY("item","barcode_group")
);
--> statement-breakpoint
CREATE TABLE "buy_prices" (
	"id" uuid PRIMARY KEY NOT NULL,
	"item" uuid NOT NULL,
	"price" numeric NOT NULL,
	"stock" numeric DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"unit" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_groups" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"hex_color" varchar(6) NOT NULL,
	"description" varchar,
	"priority" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "sell_prices" (
	"item" uuid NOT NULL,
	"price" numeric NOT NULL,
	"price_group" uuid NOT NULL,
	CONSTRAINT "sell_prices_pkey" PRIMARY KEY("item","price","price_group")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"receipt_header" varchar,
	"receipt_footer" varchar
);
--> statement-breakpoint
CREATE TABLE "transaction_items" (
	"transaction" uuid NOT NULL,
	"name" varchar NOT NULL,
	"unit" varchar NOT NULL,
	"sell_price" numeric NOT NULL,
	"quantity" numeric NOT NULL,
	"buy_price" numeric NOT NULL,
	"buy_price_id" uuid,
	"updateStock" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"cashier" varchar NOT NULL,
	"total_price" numeric NOT NULL,
	"customer_price_group" varchar NOT NULL,
	"held" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jwks" (
	"id" text PRIMARY KEY NOT NULL,
	"public_key" text NOT NULL,
	"private_key" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"active" boolean DEFAULT false NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "barcodes" ADD CONSTRAINT "items_fk" FOREIGN KEY ("item") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "barcodes" ADD CONSTRAINT "barcode_group_fk" FOREIGN KEY ("barcode_group") REFERENCES "public"."barcode_groups"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "buy_prices" ADD CONSTRAINT "items_fk" FOREIGN KEY ("item") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "units_fk" FOREIGN KEY ("unit") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sell_prices" ADD CONSTRAINT "items_fk" FOREIGN KEY ("item") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sell_prices" ADD CONSTRAINT "price_group_fk" FOREIGN KEY ("price_group") REFERENCES "public"."price_groups"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transaction_items" ADD CONSTRAINT "transactions_fk" FOREIGN KEY ("transaction") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transaction_items" ADD CONSTRAINT "buy_prices_fk" FOREIGN KEY ("buy_price_id") REFERENCES "public"."buy_prices"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "name_index" ON "price_groups" USING btree ("name");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");