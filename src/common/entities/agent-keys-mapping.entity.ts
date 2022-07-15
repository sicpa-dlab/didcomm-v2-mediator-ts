import { Agent } from '@common/entities/agent.entity'
import { Identified } from '@common/entities/identified.entity'
import { Entity, Index, ManyToOne, Property } from '@mikro-orm/core'

@Entity()
export class AgentKeysMapping extends Identified {
  @Index()
  @Property()
  public kid: string

  @ManyToOne(() => Agent, { onDelete: 'cascade' })
  public agent: Agent

  constructor(props: Omit<AgentKeysMapping, keyof Identified>) {
    super()
    this.kid = props.kid
    this.agent = props.agent
  }
}
