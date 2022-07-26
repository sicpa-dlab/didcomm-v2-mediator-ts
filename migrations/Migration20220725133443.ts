import { Migration } from '@mikro-orm/migrations';

export class Migration20220725133443 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "agent" ("id" varchar(255) not null, "did" varchar(255) not null, "delivery_type" text check ("delivery_type" in (\'Push\', \'WebHook\')) null, "delivery_data" varchar(255) null);');
    this.addSql('create index "agent_did_index" on "agent" ("did");');
    this.addSql('alter table "agent" add constraint "agent_pkey" primary key ("id");');

    this.addSql('create table "agent_registered_did" ("id" varchar(255) not null, "did" text not null, "agent_id" varchar(255) not null);');
    this.addSql('create index "agent_registered_did_did_index" on "agent_registered_did" ("did");');
    this.addSql('alter table "agent_registered_did" add constraint "agent_registered_did_pkey" primary key ("id");');

    this.addSql('create table "agent_message" ("id" varchar(255) not null, "created_at" timestamptz(0) not null, "payload" jsonb not null, "agent_id" varchar(255) not null);');
    this.addSql('alter table "agent_message" add constraint "agent_message_pkey" primary key ("id");');

    this.addSql('alter table "agent_registered_did" add constraint "agent_registered_did_agent_id_foreign" foreign key ("agent_id") references "agent" ("id") on update cascade on delete cascade;');

    this.addSql('alter table "agent_message" add constraint "agent_message_agent_id_foreign" foreign key ("agent_id") references "agent" ("id") on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "agent_registered_did" drop constraint "agent_registered_did_agent_id_foreign";');

    this.addSql('alter table "agent_message" drop constraint "agent_message_agent_id_foreign";');

    this.addSql('drop table if exists "agent" cascade;');

    this.addSql('drop table if exists "agent_registered_did" cascade;');

    this.addSql('drop table if exists "agent_message" cascade;');
  }

}
