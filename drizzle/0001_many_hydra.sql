CREATE TABLE "user_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"decrementStock" boolean DEFAULT true,
	"showHisotryItems" boolean DEFAULT false,
	"showTrxSummary" boolean DEFAULT false,
	"hideTrxMarginAndDiscounts" boolean DEFAULT true,
	"hideTrxBuyPrice" boolean DEFAULT true,
	"hideHistoryReports" boolean DEFAULT true,
	"hideItemMarginAndDiscounts" boolean DEFAULT true,
	"coloredSellPrice" boolean DEFAULT false,
	"uppercaseInput" boolean DEFAULT true
);
--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_id_user_id_fk" FOREIGN KEY ("id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;