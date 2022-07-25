import { Agent } from '@common/entities/agent.entity'
import { Identified } from '@common/entities/identified.entity'
import { Entity, Index, ManyToOne, Property, TextType } from '@mikro-orm/core'

@Entity()
export class AgentRegisteredDid extends Identified {
  @Index()
  @Property({ type: TextType })
  public did: string

  @ManyToOne(() => Agent, { onDelete: 'cascade' })
  public agent: Agent

  constructor(props: Omit<AgentRegisteredDid, keyof Identified>) {
    super()
    this.did = props.did
    this.agent = props.agent
  }
}

export enum AgentRegisteredDidReferenceFields {
  Agent = 'agent',
}
