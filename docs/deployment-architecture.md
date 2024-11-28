
```mermaid
graph TD
    A[Cloudflare Pages<br/>lightrag-nuxt] -->|API Calls| B[Cloudflare Worker<br/>kv-vector-store]
    B -->|Uses| C[KV Storage]
    B -->|Uses| D[Vectorize]
    B -->|Uses| E[D1 Database]
    B -->|Uses| F[AI Models]

```

File Restrictions
	•	Maximum 20,000 files per site
	•	Individual file size limit of 25 MiB
	•	Headers file (`_headers`) restrictions:
	•	Maximum 100 header rules
	•	2,000 character limit per individual header