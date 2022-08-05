import { Migration } from '@mikro-orm/migrations';

export class Migration20220803230850 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "agent" drop constraint if exists "agent_delivery_type_check";');

    this.addSql('alter table "agent" alter column "delivery_type" type text using ("delivery_type"::text);');
    this.addSql('alter table "agent" add constraint "agent_delivery_type_check" check ("delivery_type" in (\'Push\', \'WebHook\', \'WebSocket\'));');
  }

  async down(): Promise<void> {
    this.addSql('alter table "agent" drop constraint if exists "agent_delivery_type_check";');

    this.addSql('alter table "agent" alter column "delivery_type" type text using ("delivery_type"::text);');
    this.addSql('alter table "agent" add constraint "agent_delivery_type_check" check ("delivery_type" in (\'Push\', \'WebHook\'));');
  }

}
