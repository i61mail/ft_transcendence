const fastifyOptions = {
    logger: true,
    ajv: {
        customOptions: {
          removeAdditional: false,
          allErrors: true
        }
      }
}


export default fastifyOptions;