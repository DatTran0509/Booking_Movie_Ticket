# ☁️ Cloud Architecture — Booking Movie Ticket

> Production infrastructure on AWS with automated CI/CD, monitoring, and multi-layer security.

---

## 🏗️ High-Level Architecture

```mermaid
graph TB
    %% ===== USERS =====
    User["🌐 Users<br/><i>Browser</i>"]

    %% ===== DNS & CDN =====
    subgraph DNS_CDN["Domain & CDN"]
        direction LR
        Hostinger["🏠 Hostinger<br/><i>Domain Registrar</i>"]
        Cloudflare["☁️ Cloudflare<br/><i>DNS · Proxy · SSL/TLS<br/>DDoS Protection</i>"]
    end

    %% ===== AWS =====
    subgraph AWS["Amazon Web Services · ap-southeast-1"]
        direction TB

        subgraph LB["Load Balancing"]
            ALB["⚖️ ALB<br/><i>internet-facing</i>"]
            ACM["🔒 ACM<br/><i>SSL Certificate</i>"]
        end

        subgraph COMPUTE["Auto Scaling"]
            ASG["📈 ASG<br/><i>Min 1 · Max 3<br/>CPU Target 70%</i>"]
            subgraph EC2["EC2 · t3.micro · Amazon Linux 2023"]
                direction LR
                Nginx["🐳 Nginx<br/><i>Client SPA · :80</i>"]
                NodeJS["🐳 Node.js ×2<br/><i>Server API · :3000</i>"]
            end
        end

        subgraph STORAGE["Container Registry"]
            ECR_S["📦 ECR<br/><i>server image</i>"]
            ECR_C["📦 ECR<br/><i>client image</i>"]
        end

        subgraph OPS["Operations"]
            SSM["🔐 SSM Parameter Store<br/><i>Secrets · .env</i>"]
            CWLogs["📊 CloudWatch Logs<br/><i>Docker container logs</i>"]
            Session["🖥️ Session Manager<br/><i>Shell access · No SSH</i>"]
        end

        CFN["🏗️ CloudFormation<br/><i>Infrastructure as Code</i>"]
    end

    %% ===== CI/CD =====
    subgraph CICD["GitHub · CI/CD"]
        Repo["📂 Repository"]
        subgraph Actions["⚡ GitHub Actions"]
            direction LR
            BuildS["🔨 build-server"]
            BuildC["🔨 build-client"]
            Deploy["🚀 deploy"]
        end
        OIDC["🔑 OIDC Federation<br/><i>No static AWS keys</i>"]
    end

    %% ===== EXTERNAL =====
    subgraph EXT["External Services"]
        direction LR
        MongoDB["🍃 MongoDB Atlas"]
        Clerk["🔐 Clerk"]
        Stripe["💳 Stripe"]
        TMDB["🎬 TMDB"]
        Brevo["📧 Brevo"]
        Inngest["⚙️ Inngest"]
    end

    %% ===== CONNECTIONS =====
    User -->|HTTPS| Hostinger
    Hostinger -->|NS| Cloudflare
    Cloudflare -->|"HTTPS :443<br/><i>Cloudflare IPs only</i>"| ALB
    ACM -.->|cert| ALB
    ALB -->|":80"| Nginx
    Nginx -->|"/api/*"| NodeJS
    ASG -->|manages| EC2

    Repo -->|push main| Actions
    BuildS -->|push| ECR_S
    BuildC -->|push| ECR_C
    BuildS --> Deploy
    BuildC --> Deploy
    Deploy -->|Instance Refresh| ASG
    OIDC -.->|auth| Actions

    EC2 -->|pull| ECR_S
    EC2 -->|pull| ECR_C
    SSM -->|.env| EC2
    SSM -->|VITE_* args| BuildC
    EC2 -->|logs| CWLogs

    NodeJS --> MongoDB
    NodeJS --> Clerk
    NodeJS --> Stripe
    NodeJS --> TMDB
    NodeJS --> Brevo
    NodeJS --> Inngest

    %% ===== STYLING =====
    style AWS fill:#232F3E,stroke:#FF9900,color:#fff
    style DNS_CDN fill:#1a1a2e,stroke:#F6821F,color:#fff
    style CICD fill:#1a1a2e,stroke:#6e5494,color:#fff
    style EXT fill:#1a1a2e,stroke:#6C63FF,color:#fff
    style LB fill:#2d2d44,stroke:#FF9900,color:#fff
    style COMPUTE fill:#2d2d44,stroke:#FF9900,color:#fff
    style STORAGE fill:#2d2d44,stroke:#FF9900,color:#fff
    style OPS fill:#2d2d44,stroke:#FF9900,color:#fff
    style EC2 fill:#3d3d5c,stroke:#FF9900,color:#fff
    style Actions fill:#2d2d44,stroke:#6e5494,color:#fff
```

---

## 🔄 Request Flow

Shows how a user request travels through the system:

```mermaid
sequenceDiagram
    actor User
    participant CF as ☁️ Cloudflare
    participant ALB as ⚖️ ALB
    participant Nginx as 🐳 Nginx
    participant Node as 🐳 Node.js
    participant DB as 🍃 MongoDB
    participant Auth as 🔐 Clerk

    Note over User,CF: 1️⃣ DNS Resolution + SSL

    User->>CF: https://quickshow.vn
    CF->>CF: DNS resolve + SSL/TLS termination
    CF->>ALB: Forward (Cloudflare IPs only)

    Note over ALB,Nginx: 2️⃣ Load Balancing

    ALB->>ALB: HTTP :80 → redirect HTTPS :443
    ALB->>Nginx: Forward to Target Group

    Note over Nginx,Node: 3️⃣ Application Layer

    Nginx-->>User: Static files (React SPA)
    User->>CF: GET /api/movies
    CF->>ALB: Forward
    ALB->>Nginx: Route
    Nginx->>Node: Reverse proxy /api/*
    Node->>Auth: Verify JWT token
    Auth-->>Node: ✅ Valid user
    Node->>DB: Query data
    DB-->>Node: Results
    Node-->>User: JSON response
```

---

## ⚡ CI/CD Pipeline

Automated build and deploy on every push to `main`:

```mermaid
sequenceDiagram
    actor Dev as 👨‍💻 Developer
    participant GH as 📂 GitHub
    participant S as 🔨 build-server
    participant C as 🔨 build-client
    participant D as 🚀 deploy
    participant ECR as 📦 ECR
    participant SSM as 🔐 SSM
    participant ASG as 📈 ASG

    Dev->>GH: git push origin main

    Note over S,C: Parallel builds with Docker layer cache

    par
        GH->>S: Trigger
        S->>S: docker build ./server
        S->>ECR: Push server:sha + latest
    and
        GH->>C: Trigger
        C->>SSM: Fetch VITE_* build args
        C->>C: docker build ./client
        C->>ECR: Push client:sha + latest
    end

    S-->>D: ✅
    C-->>D: ✅

    Note over D,ASG: Rolling deployment

    D->>ASG: StartInstanceRefresh
    ASG->>ASG: Launch new EC2
    ASG->>ASG: Pull images from ECR
    ASG->>ASG: Health check (/healthz)
    ASG->>ASG: Terminate old EC2
    D-->>GH: ✅ Deploy successful
```

---

## 🐳 EC2 Bootstrap (User Data)

What happens when a new EC2 instance launches:

```mermaid
sequenceDiagram
    participant ASG as 📈 ASG
    participant EC2 as 🖥️ EC2
    participant PKG as 📦 yum
    participant CW as 📊 CloudWatch
    participant GH as 📂 GitHub
    participant SSM as 🔐 SSM
    participant ECR as 📦 ECR

    ASG->>EC2: Launch instance

    Note over EC2,PKG: Step 1 — Dependencies
    EC2->>PKG: Install Docker, Git, CloudWatch Agent
    EC2->>EC2: Start Docker daemon

    Note over EC2,CW: Step 2 — Monitoring
    EC2->>CW: Configure + start CloudWatch Agent
    Note right of CW: Ships Docker logs →<br/>/booking-movie-ticket/docker

    Note over EC2,GH: Step 3 — Application Code
    EC2->>EC2: Install Docker Compose v2
    EC2->>GH: git clone (depth 1)
    Note right of GH: Only docker-compose.yml<br/>needed, no build

    Note over EC2,SSM: Step 4 — Secrets
    EC2->>SSM: Fetch /booking-movie-ticket/prod/env
    EC2->>EC2: Write .env + ECR_REGISTRY

    Note over EC2,ECR: Step 5 — Start Application
    EC2->>ECR: docker login + pull images
    EC2->>EC2: docker compose up -d
    Note right of EC2: Nginx :80 + Node.js ×2 :3000
    EC2-->>ASG: ✅ Health check passes
```

---

## 🔒 Security Layers

```mermaid
graph LR
    subgraph L1["Layer 1 — Edge"]
        CF_WAF["☁️ Cloudflare<br/>DDoS · WAF · Rate Limit"]
    end

    subgraph L2["Layer 2 — Network"]
        PL["📋 Prefix List<br/>Cloudflare IPs only"]
        ALB_SG["🔒 ALB Security Group<br/>:80/:443 from Cloudflare"]
    end

    subgraph L3["Layer 3 — Compute"]
        EC2_SG["🔒 EC2 Security Group<br/>:80 from ALB only"]
        NO_SSH["🚫 No SSH port"]
        SSM_SH["🖥️ SSM Session Manager<br/>IAM-based shell access"]
    end

    subgraph L4["Layer 4 — Secrets & Auth"]
        SSM_S["🔐 SSM Parameter Store<br/>KMS encrypted"]
        IAM_R["🔑 IAM Roles<br/>Least privilege"]
        OIDC_F["🔑 OIDC Federation<br/>No static AWS keys"]
    end

    L1 -->|"filtered traffic"| L2
    L2 -->|"ALB only"| L3
    L3 -->|"IAM auth"| L4

    style L1 fill:#e74c3c,stroke:#c0392b,color:#fff
    style L2 fill:#e67e22,stroke:#d35400,color:#fff
    style L3 fill:#f39c12,stroke:#e67e22,color:#fff
    style L4 fill:#27ae60,stroke:#1e8449,color:#fff
```

---

## 📋 Services & Tools

| Category | Service | Role |
|----------|---------|------|
| **Domain** | Hostinger | Domain registrar |
| **CDN & Security** | Cloudflare | DNS, Proxy, SSL/TLS, DDoS Protection |
| **Load Balancer** | AWS ALB | HTTP→HTTPS redirect, traffic distribution |
| **Compute** | AWS EC2 (ASG) | t3.micro, Auto Scaling (1–3 instances) |
| **Containers** | Docker Compose | Nginx (client) + Node.js ×2 (server) |
| **Registry** | AWS ECR | Docker images, lifecycle policy (keep 5) |
| **Secrets** | AWS SSM Parameter Store | All environment variables (encrypted) |
| **SSL** | AWS ACM | Certificate for ALB HTTPS listener |
| **Logging** | AWS CloudWatch | Docker container logs |
| **Shell Access** | AWS SSM Session Manager | IAM-based access, no SSH |
| **IaC** | AWS CloudFormation | All AWS resource management |
| **CI/CD** | GitHub Actions | Build, push, deploy pipeline |
| **Auth** | AWS IAM + OIDC | Federated auth, no static keys |
| **Database** | MongoDB Atlas | Managed NoSQL database |
| **User Auth** | Clerk | User authentication & management |
| **Payments** | Stripe | Payment processing |
| **Movie Data** | TMDB API | Movie information source |
| **Email** | Brevo (SMTP) | Transactional emails |
| **Background Jobs** | Inngest | Async task processing |
