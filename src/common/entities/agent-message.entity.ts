import { Agent } from '@common/entities/agent.entity'
import { Identified } from '@common/entities/identified.entity'
import { Entity, JsonType, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { Attachment } from 'didcomm-node'
import { v4 } from 'uuid'

@Entity()
export class AgentMessage implements Identified {
  @PrimaryKey()
  public id: string

  @Property()
  public recipient: string

  @Property()
  public createdAt: Date = new Date()

  @Property({ type: JsonType })
  public payload: Attachment

  @ManyToOne(() => Agent, { onDelete: 'cascade' })
  public agent: Agent

  constructor(props: Omit<AgentMessage, keyof Identified | 'createdAt'>) {
    this.id = props.payload.id || v4()
    this.payload = props.payload
    this.payload.id = this.id
    this.agent = props.agent
    this.recipient = props.recipient
  }
}
