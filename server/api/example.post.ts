export default defineEventHandler(async (event) => {
  try {
    // Your logic here
  } catch (e) {
    throw createError({
      statusCode: 400,
      message: 'Something went wrong'
    })
  }
}) 