import { Migration } from '@mikro-orm/migrations';

export class Migration20220708235310 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "agent" ("id" varchar(255) not null, "did" varchar(255) not null, "did_doc" jsonb not null, "delivery_type" text check ("delivery_type" in (\'mobile\', \'web\')) not null, "delivery_data" varchar(255) not null, "messages" jsonb not null);');
    this.addSql('alter table "agent" add constraint "agent_pkey" primary key ("id");');

    this.addSql('create table "agent_keys_mapping" ("id" varchar(255) not null, "kid" varchar(255) not null, "agent_id" varchar(255) not null);');
    this.addSql('alter table "agent_keys_mapping" add constraint "agent_keys_mapping_pkey" primary key ("id");');
    this.addSql('create index "agent_keys_mapping_kid_index" on "agent_keys_mapping" ("kid");');

    this.addSql('alter table "agent_keys_mapping" add constraint "agent_keys_mapping_agent_id_foreign" foreign key ("agent_id") references "agent" ("id") on update cascade on delete cascade;');
  }

}
