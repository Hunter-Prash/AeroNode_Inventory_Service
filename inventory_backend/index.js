import serverlessExpress from '@vendia/serverless-express'
import expressApp from './src/app.js'



// The exported 'handler' is the actual entry point Lambda will execute
// serverlessExpress({ app }) returns a function that acts as the Lambda handler.
export const handler=serverlessExpress({app:expressApp})