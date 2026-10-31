CREATE TABLE "user_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"decrementStock" boolean DEFAULT true NOT NULL,
	"showHisotryItems" boolean DEFAULT false NOT NULL,
	"showTrxSummary" boolean DEFAULT false NOT NULL,
	"hideTrxBuyPrice" boolean DEFAULT true NOT NULL,
	"hideHistoryReports" boolean DEFAULT true NOT NULL,
	"hideMarginAndDiscounts" boolean DEFAULT true NOT NULL,
	"coloredSellPrice" boolean DEFAULT false NOT NULL,
	"uppercaseInput" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_id_user_id_fk" FOREIGN KEY ("id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;