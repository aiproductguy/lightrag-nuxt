export default defineEventHandler(async (event) => {
  // Type-safe access to Cloudflare bindings
  const { MY_KV } = event.context.cloudflare.env
  
  // Return type will be inferred
  return {
    data: await MY_KV.get('some-key')
  }
}) 