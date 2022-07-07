import { registerAs } from '@nestjs/config'
import didcomm from './didcomm'
import express from './express'
import logging from './logging'
import mikroOrm from './mikro-orm'
import pino from './pino'

export default [
  registerAs('express', express),
  registerAs('logging', logging),
  registerAs('mikro-orm', mikroOrm),
  registerAs('pino', pino),
  registerAs('didcomm', didcomm),
]
