import { AgentKeysMapping } from '@common/entities/agent-keys-mapping.entity'
import { Collection, Entity, Enum, JsonType, OneToMany, Property } from '@mikro-orm/core'
import { DidDocument } from '@sicpa-dlab/peer-did-ts'
import { Identified } from './identified.entity'

@Entity()
export class Agent extends Identified {
  @Property()
  public did: string

  @Property({ type: JsonType })
  public didDoc: DidDocument

  @Enum(() => AgentDeliveryType)
  public deliveryType: AgentDeliveryType

  @Property()
  public deliveryData: string

  @Property({ type: JsonType })
  public messages: Map<string, string> = new Map<string, string>()

  @OneToMany(() => AgentKeysMapping, (keyMapping) => keyMapping.agent)
  public keysMappings: Collection<AgentKeysMapping> = new Collection<AgentKeysMapping>(this)

  constructor(props: Omit<Agent, keyof Identified | 'messages' | 'keysMappings'>) {
    super()
    this.did = props.did
    this.didDoc = props.didDoc
    this.deliveryType = props.deliveryType
    this.deliveryData = props.deliveryData
  }
}

export enum AgentDeliveryType {
  Mobile = 'mobile',
  Web = 'web',
}
