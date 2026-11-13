CREATE INDEX "buy_prices_item_index" ON "buy_prices" USING btree ("item");--> statement-breakpoint
CREATE INDEX "items_unit_index" ON "items" USING btree ("unit");--> statement-breakpoint
CREATE INDEX "transaction_items_transaction_index" ON "transaction_items" USING btree ("transaction");--> statement-breakpoint
CREATE INDEX "transactions_held_created_at_index" ON "transactions" USING btree ("held","created_at");