import { ApiParam } from '@nestjs/swagger'

export const ApiIdRequest = () => ApiParam({ name: 'id', type: String })
