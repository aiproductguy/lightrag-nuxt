# Footer Component

The footer component is located in the `components/AppFooter.vue` file. It is used to display the footer of the application, should look roughly like this:

## Footer Toggle (default closed)

### About Tab
- Version
- Build Date
- Commit Hash

### Index Tab
> Documents (0) [+ Upsert]
> Webpages (0) [+ Upsert]

### Chat Tab
- Chat Input
- View History (prompt and response)

### Query Tab
- Query Input
- View History (prompt, knowledge, and response)

### Stats Tab
- Total Documents
- Total Chunks
- Path Distribution

### Tests Tab
- Test LLM
- Test Embedding
- Test Index

### Settings Tab
#### Model Selection
- SLM (for Chat) {model stats} {check valid api key}
- LLM (for Query) {model stats} {check valid api key}
- Embed (for Index) {model stats} {check valid api key}
#### Storage Selection
- Clear Cache {cache stats}
- Processing Path #disabled

### Activity Log
{move from stats.vue page}


---
The sections should be styled as tooltips with a hover effect.
{model stats}: token limits, model name, model provider
{check valid api key}: uses emoji icons for status
{cache stats}: cache size, number of records
