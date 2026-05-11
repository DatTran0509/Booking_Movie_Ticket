# Booking Movie Ticket — Cloud Architecture

## Full Architecture Diagram

```mermaid
graph TB
    subgraph USERS["👤 End Users"]
        Browser["🌐 Browser"]
    end

    subgraph HOSTINGER["🏠 Hostinger"]
        Domain["📌 Domain<br/>quickshow.vn"]
    end

    subgraph CLOUDFLARE["☁️ Cloudflare"]
        DNS["DNS Records<br/>A/CNAME → ALB"]
        Proxy["Proxy & CDN<br/>DDoS Protection"]
        SSL_CF["SSL/TLS<br/>Full (Strict)"]
    end

    subgraph AWS["☁️ AWS (ap-southeast-1)"]
        subgraph NETWORKING["🔒 Networking"]
            PrefixList["Cloudflare<br/>Prefix List<br/>(15 IPv4 CIDRs)"]
            ALB_SG["ALB Security Group<br/>Port 80/443<br/>from Cloudflare only"]
            EC2_SG["EC2 Security Group<br/>Port 80<br/>from ALB only"]
        end

        subgraph LOADBALANCER["⚖️ Load Balancing"]
            ALB["Application<br/>Load Balancer<br/>(internet-facing)"]
            HTTP_L["HTTP Listener :80<br/>→ Redirect 301 to HTTPS"]
            HTTPS_L["HTTPS Listener :443<br/>→ Forward to TG"]
            TG["Target Group<br/>/healthz health check"]
        end

        subgraph COMPUTE["🖥️ Compute (ASG)"]
            ASG["Auto Scaling Group<br/>Min: 1 | Max: 3<br/>CPU Target: 70%"]
            LT["Launch Template<br/>t3.micro | AL2023"]
            EC2_1["EC2 Instance"]
        end

        subgraph CONTAINERS["🐳 Docker Compose (per EC2)"]
            Client["Client Container<br/>Nginx :80<br/>(React/Vite SPA)"]
            Server1["Server Container #1<br/>Node.js :3000"]
            Server2["Server Container #2<br/>Node.js :3000<br/>(replica)"]
        end

        subgraph ECR_BLOCK["📦 ECR"]
            ECR_S["booking-movie-ticket/server<br/>Keep last 5 images"]
            ECR_C["booking-movie-ticket/client<br/>Keep last 5 images"]
        end

        subgraph CONFIG["🔐 Config & Secrets"]
            SSM["SSM Parameter Store<br/>/booking-movie-ticket/prod/env<br/>(SecureString)"]
            ACM["ACM Certificate<br/>(SSL for ALB)"]
        end

        subgraph MONITORING["📊 Monitoring & Logging"]
            CW_Agent["CloudWatch Agent<br/>(on each EC2)"]
            CW_Logs["CloudWatch Logs<br/>/booking-movie-ticket/docker"]
            SSM_Session["SSM Session Manager<br/>(Shell Access — no SSH)"]
        end

        subgraph IAM_BLOCK["🔑 IAM"]
            OIDC["OIDC Provider<br/>token.actions.githubusercontent.com"]
            GH_Role["GitHub Actions Role<br/>ECR Push + ASG Refresh + SSM Read"]
            EC2_Role["EC2 Instance Role<br/>ECR Pull + SSM Read + CloudWatch"]
            EC2_Profile["Instance Profile"]
        end

        subgraph INFRA["🏗️ Infrastructure as Code"]
            CFN["CloudFormation Stack<br/>booking-movie-ticket"]
        end
    end

    subgraph GITHUB["🐙 GitHub"]
        Repo["Repository<br/>DatTran0509/Booking_Movie_Ticket"]
        subgraph CICD["⚡ GitHub Actions (CI/CD)"]
            direction TB
            Trigger["Push to main"]
            Job1["build-server<br/>(parallel)"]
            Job2["build-client<br/>(parallel)"]
            Job3["deploy<br/>ASG Instance Refresh"]
        end
    end

    subgraph EXTERNAL["🌍 External Services"]
        MongoDB["MongoDB Atlas<br/>(Database)"]
        Clerk["Clerk<br/>(Auth)"]
        Stripe["Stripe<br/>(Payments)"]
        TMDB["TMDB API<br/>(Movie Data)"]
        Brevo["Brevo SMTP<br/>(Email)"]
        Inngest["Inngest<br/>(Background Jobs)"]
    end

    %% User Flow
    Browser -->|"HTTPS"| Domain
    Domain -->|"NS delegation"| DNS
    DNS --> Proxy
    Proxy -->|"SSL/TLS"| SSL_CF
    SSL_CF -->|"HTTPS :443"| ALB
    ALB --> HTTP_L
    ALB --> HTTPS_L
    HTTP_L -->|"301 redirect"| HTTPS_L
    HTTPS_L --> TG
    TG -->|":80"| EC2_1

    %% EC2 Internal
    EC2_1 --> Client
    Client -->|"/api/* proxy"| Server1
    Client -->|"/api/* proxy"| Server2

    %% Security Groups
    PrefixList -.->|"allows"| ALB_SG
    ALB_SG -.->|"protects"| ALB
    EC2_SG -.->|"protects"| EC2_1

    %% ASG
    ASG -->|"manages"| EC2_1
    LT -->|"configures"| ASG
    ACM -->|"certificate"| HTTPS_L

    %% ECR
    EC2_1 -->|"docker pull"| ECR_S
    EC2_1 -->|"docker pull"| ECR_C

    %% Config
    SSM -->|".env secrets"| EC2_1
    SSM -->|"VITE_* build args"| Job2
    EC2_Role --> EC2_Profile
    EC2_Profile -.->|"attached to"| LT

    %% Monitoring
    CW_Agent -->|"ships logs"| CW_Logs
    EC2_1 -->|"runs"| CW_Agent
    SSM_Session -.->|"shell access"| EC2_1

    %% CI/CD Flow
    Repo -->|"push main"| Trigger
    Trigger --> Job1
    Trigger --> Job2
    Job1 -->|"push image"| ECR_S
    Job2 -->|"push image"| ECR_C
    Job1 --> Job3
    Job2 --> Job3
    Job3 -->|"StartInstanceRefresh"| ASG

    %% IAM
    OIDC -.->|"trusts"| GH_Role
    GH_Role -.->|"used by"| CICD

    %% External Services
    Server1 --> MongoDB
    Server1 --> Clerk
    Server1 --> Stripe
    Server1 --> TMDB
    Server1 --> Brevo
    Server1 --> Inngest

    %% CloudFormation manages everything
    CFN -.->|"manages all AWS resources"| AWS

    %% Styling
    classDef aws fill:#FF9900,stroke:#232F3E,color:#232F3E,font-weight:bold
    classDef cloudflare fill:#F6821F,stroke:#fff,color:#fff,font-weight:bold
    classDef github fill:#24292e,stroke:#fff,color:#fff,font-weight:bold
    classDef external fill:#6C63FF,stroke:#fff,color:#fff,font-weight:bold
    classDef security fill:#DD3522,stroke:#fff,color:#fff,font-weight:bold
```

---

## Request Flow (chi tiết từng bước)

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant H as 🏠 Hostinger DNS
    participant CF as ☁️ Cloudflare
    participant ALB as ⚖️ AWS ALB
    participant Nginx as 🐳 Nginx (Client)
    participant Node as 🐳 Node.js (Server)
    participant DB as 🍃 MongoDB Atlas
    participant Auth as 🔐 Clerk

    U->>H: quickshow.vn
    H->>CF: NS → Cloudflare
    CF->>CF: DNS resolve + Proxy + SSL/TLS
    CF->>ALB: HTTPS :443 (Cloudflare IP only)
    ALB->>Nginx: HTTP :80 (via Target Group)
    
    Note over Nginx: Static SPA files (React)
    Nginx-->>U: HTML/CSS/JS

    U->>CF: GET /api/movies
    CF->>ALB: HTTPS :443
    ALB->>Nginx: HTTP :80
    Nginx->>Node: Reverse proxy /api/*
    Node->>DB: Query movies
    DB-->>Node: Movie data
    Node->>Auth: Verify JWT
    Auth-->>Node: User info
    Node-->>Nginx: JSON response
    Nginx-->>ALB: Response
    ALB-->>CF: Response
    CF-->>U: JSON data
```

---

## CI/CD Pipeline Flow

```mermaid
sequenceDiagram
    participant Dev as 👨‍💻 Developer
    participant GH as 🐙 GitHub
    participant GA_S as ⚡ build-server
    participant GA_C as ⚡ build-client
    participant GA_D as ⚡ deploy
    participant OIDC as 🔑 AWS OIDC
    participant ECR as 📦 ECR
    participant SSM as 🔐 SSM
    participant ASG as 🖥️ ASG

    Dev->>GH: git push origin main
    GH->>GA_S: Trigger (parallel)
    GH->>GA_C: Trigger (parallel)

    par Build Server
        GA_S->>OIDC: Assume Role (OIDC)
        OIDC-->>GA_S: Temporary credentials
        GA_S->>GA_S: docker build ./server
        GA_S->>ECR: Push server:sha + server:latest
    and Build Client
        GA_C->>OIDC: Assume Role (OIDC)
        OIDC-->>GA_C: Temporary credentials
        GA_C->>SSM: Fetch VITE_* build args
        SSM-->>GA_C: Environment variables
        GA_C->>GA_C: docker build ./client (with build args)
        GA_C->>ECR: Push client:sha + client:latest
    end

    GA_S-->>GA_D: Done
    GA_C-->>GA_D: Done

    GA_D->>OIDC: Assume Role (OIDC)
    OIDC-->>GA_D: Temporary credentials
    GA_D->>ASG: Cancel existing refresh (if any)
    GA_D->>ASG: StartInstanceRefresh
    
    Note over ASG: Rolling update:<br/>Launch new EC2 → Pull ECR images<br/>→ Health check → Terminate old EC2
    
    loop Poll every 30s (max 25min)
        GA_D->>ASG: DescribeInstanceRefreshes
        ASG-->>GA_D: Status: InProgress/Successful/Failed
    end

    GA_D-->>GH: ✅ Deployment Successful
```

---

## EC2 Bootstrap Flow (User Data)

```mermaid
sequenceDiagram
    participant ASG as 🖥️ ASG
    participant EC2 as 🐳 EC2 Instance
    participant YUM as 📦 yum
    participant CW as 📊 CloudWatch Agent
    participant GIT as 🐙 GitHub (public)
    participant SSM as 🔐 SSM Parameter Store
    participant ECR as 📦 ECR
    participant DC as 🐳 Docker Compose

    ASG->>EC2: Launch new instance (UserData)
    EC2->>EC2: set -euo pipefail + logging
    
    EC2->>YUM: Install docker, git, cloudwatch-agent
    EC2->>EC2: systemctl start docker
    
    EC2->>CW: Write config + start agent
    Note over CW: Ships /var/lib/docker/containers/**/*-json.log<br/>→ /booking-movie-ticket/docker
    
    EC2->>EC2: Install Docker Compose v2
    EC2->>GIT: git clone (depth 1, docker-compose.yml only)
    
    EC2->>SSM: Fetch /booking-movie-ticket/prod/env
    SSM-->>EC2: .env content (decrypted)
    EC2->>EC2: Write .env + append ECR_REGISTRY
    
    EC2->>ECR: docker login + docker compose pull
    ECR-->>EC2: server:latest + client:latest
    
    EC2->>DC: docker compose up -d
    Note over DC: Client (Nginx :80) + Server x2 (Node :3000)
    
    EC2-->>ASG: Health check passes (/healthz)
```

---

## Security Architecture

```mermaid
graph LR
    subgraph PUBLIC["🌐 Public Internet"]
        User["👤 Users"]
    end

    subgraph CF_LAYER["☁️ Cloudflare Layer"]
        WAF["DDoS Protection<br/>+ Rate Limiting"]
        SSL1["SSL/TLS Termination<br/>(Edge)"]
    end

    subgraph AWS_PERIMETER["🔒 AWS Perimeter"]
        PL["Prefix List<br/>(Cloudflare IPs only)"]
        ALB_SG2["ALB SG<br/>:80/:443 from CF"]
        SSL2["SSL/TLS<br/>(ACM Certificate)"]
    end

    subgraph PRIVATE["🔐 Private Layer"]
        EC2_SG2["EC2 SG<br/>:80 from ALB only"]
        NoSSH["❌ No SSH port open"]
        SSM2["SSM Session Manager<br/>(IAM-based access)"]
    end

    subgraph SECRETS["🗝️ Secrets Management"]
        SSM_PS["SSM Parameter Store<br/>(SecureString / KMS)"]
        IAM["IAM Roles<br/>(No static keys)"]
        OIDC2["OIDC Federation<br/>(GitHub → AWS)"]
    end

    User -->|"HTTPS"| WAF
    WAF --> SSL1
    SSL1 -->|"Only CF IPs"| PL
    PL --> ALB_SG2
    ALB_SG2 --> SSL2
    SSL2 -->|"Only ALB"| EC2_SG2
    EC2_SG2 --> NoSSH
    SSM2 -.->|"IAM auth"| IAM
    SSM_PS -.->|"encrypted"| IAM
    OIDC2 -.->|"no static keys"| IAM
```

---

## Services Summary

| Layer | Service | Purpose |
|-------|---------|---------|
| **Domain** | Hostinger | Domain registration (quickshow.vn) |
| **CDN/Proxy** | Cloudflare | DNS, SSL/TLS, DDoS protection, CDN |
| **Load Balancer** | AWS ALB | HTTP→HTTPS redirect, traffic distribution |
| **Compute** | EC2 (ASG) | Auto-scaling, t3.micro, AL2023 |
| **Containers** | Docker Compose | Nginx (client) + Node.js x2 (server) |
| **Registry** | AWS ECR | Docker image storage (lifecycle: keep 5) |
| **Secrets** | SSM Parameter Store | All env vars (encrypted) |
| **SSL** | ACM | Certificate for ALB HTTPS |
| **Monitoring** | CloudWatch Logs | Docker container logs |
| **Shell Access** | SSM Session Manager | No SSH, IAM-based |
| **IaC** | CloudFormation | All AWS resources |
| **CI/CD** | GitHub Actions | Build → Push ECR → Instance Refresh |
| **Auth** | OIDC + IAM Roles | No static AWS keys |
| **Database** | MongoDB Atlas | External managed DB |
| **Auth Provider** | Clerk | User authentication |
| **Payments** | Stripe | Payment processing |
| **Movies** | TMDB API | Movie data source |
| **Email** | Brevo SMTP | Transactional emails |
| **Jobs** | Inngest | Background job processing |
