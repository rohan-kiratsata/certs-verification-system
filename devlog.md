active self notes and thinking process that goes into this assignment. raw thoughts here.

> goal is to build verification system
> i think i should make it in such way that they can directly integrate this and i can raise a pr directly. prod ready
> 30 days fellowship program, once user completes the program they recieve the verifiable certificate
> should support multiple fellowship, programs, making it resuable system

> inspo given
> https://adplist.org/certifications/504

> frontend links to be created : /fueler.io/certificates/[id]

> flow simplified

1. admin selects an existing fueler user
2. the admin selects a fellowship/program
3. BE validates if user is eligible
4. BE creates certs with unique public id
5. BE generates a PDF
6. participant/user receives a public certificate link
7. anyone can open link, view and verify the cert
8. admin can revoke it later
9. a revoked cert remains visible but is no longer valid

two main thing:
program - what user completes
cert - proof that user completed the program

what i understood in simply manner it can look like:

User: Test User
Email: test@example.com
Program: Fueler 30-Day Fellowship
Certificate: FLR-26-X8D3KP9, Issued to Test User, For Fueler 30-Day Fellowship
Status: active

---

> setup project (claude did it) - first commit
