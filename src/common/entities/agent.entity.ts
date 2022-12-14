import { AgentMessage } from '@common/entities/agent-message.entity'
import { AgentRegisteredDid } from '@common/entities/agent-registered-did.entity'
import { Collection, Entity, Enum, Index, OneToMany, Property } from '@mikro-orm/core'
import { Identified } from './identified.entity'

@Entity()
export class Agent extends Identified {
  @Property()
  @Index()
  public did: string

  @Enum({ items: () => AgentDeliveryType, nullable: true })
  public deliveryType?: AgentDeliveryType

  @Property({ nullable: true })
  public deliveryData?: string

  @Property({ nullable: false })
  public liveDelivery: boolean

  @OneToMany(() => AgentMessage, (message) => message.agent, { orphanRemoval: true })
  public messages: Collection<AgentMessage> = new Collection<AgentMessage>(this)

  @OneToMany(() => AgentRegisteredDid, (registeredDid) => registeredDid.agent, { orphanRemoval: true })
  public registeredDids: Collection<AgentRegisteredDid> = new Collection<AgentRegisteredDid>(this)

  constructor(props: Omit<Agent, keyof Identified | 'messages' | 'registeredDids'>) {
    super()
    this.did = props.did
    this.deliveryType = props.deliveryType
    this.deliveryData = props.deliveryData
    this.liveDelivery = props.liveDelivery
  }
}

export enum AgentReferenceFields {
  RegisteredDids = 'registeredDids',
  Messages = 'messages',
}

export enum AgentDeliveryType {
  // Deliver received messages using push notifications
  Push = 'Push',

  // Deliver received messages using registered web hook
  WebHook = 'WebHook',

  // Deliver received messages using websocket connection
  WebSocket = 'WebSocket',
}
