# Terraform Cloud / ECS Deploy Notes

## 실행 구조

- GitHub Actions
  - Docker image build
  - ECR push
  - Terraform Cloud run 요청

- Terraform Cloud
  - Terraform state 관리
  - terraform plan/apply 실행
  - AWS Dynamic Credentials 사용
  - Cloudflare token 사용

## GitHub Secrets

Repository Settings → Secrets and variables → Actions

- `TF_API_TOKEN`
  - Terraform Cloud API Token
  - GitHub Actions가 Terraform Cloud에 접근할 때 사용

## Terraform Cloud Workspace

Workspace 이름:

- `teamspace-ECSInfra`

Workflow:

- CLI-Driven Workflow

Execution Mode:

- Remote

## Terraform Cloud Variables

### Terraform Variables

| Key                    | 설명                 | Sensitive |
| ---------------------- | -------------------- | --------- |
| `cloudflare_api_token` | Cloudflare API Token | Yes       |

### Environment Variables

| Key                     | 값                                           | 설명                                    |
| ----------------------- | -------------------------------------------- | --------------------------------------- |
| `TFC_AWS_PROVIDER_AUTH` | `true`                                       | AWS Dynamic Credentials 활성화          |
| `TFC_AWS_RUN_ROLE_ARN`  | `arn:aws:iam::990678687582:role/<role-name>` | Terraform Cloud가 assume할 AWS IAM Role |
| `AWS_DEFAULT_REGION`    | `ap-northeast-2`                             | AWS 기본 리전                           |

## 중요한 주의사항

- `cloudflare_api_token`은 GitHub Secret에 넣지 않는다.
- Cloudflare token은 Terraform Cloud Workspace Variable에 넣는다.
- `TFC_AWS_PROVIDER_AUTH`는 반드시 `true`.
- `TFC_AWS_PROVIDER_AUTH`, `TFC_AWS_RUN_ROLE_ARN`은 Terraform Variable이 아니라 Environment Variable. AWS 다이나믹 크레덴셜의 결과임
- GitHub Actions의 `gitOIDC` role은 ECR push용이다.
- Terraform Cloud의 AWS role은 ECS/ALB/IAM 등 Terraform apply용이다.

## 에러별 원인

### No valid credential sources found

원인:

- Terraform Cloud에 AWS 인증이 없음
- `TFC_AWS_PROVIDER_AUTH=false`
- `TFC_AWS_RUN_ROLE_ARN` 누락
- Environment Variable이 아니라 Terraform Variable로 넣음
- IAM Role trust policy 문제

확인:

- Workspace → Variables → Environment Variables
- `TFC_AWS_PROVIDER_AUTH=true`
- `TFC_AWS_RUN_ROLE_ARN` 존재

### Cloudflare API token 관련 에러

확인:

- Workspace → Variables → Terraform Variables
- `cloudflare_api_token` 존재
- Sensitive 체크
- Terraform 코드에 variable 선언 존재

## 배포 흐름

1. `master` 브랜치 push
2. GitHub Actions 실행
3. AWS OIDC로 `gitOIDC` role assume
4. Docker image build
5. ECR push
6. Terraform CLI가 `TF_API_TOKEN`으로 Terraform Cloud 로그인
7. `terraform init`
8. `terraform validate`
9. `terraform apply -var="container_image=<ECR_IMAGE_URI>"`
10. Terraform Cloud에서 remote run 실행
11. AWS Dynamic Credentials로 AWS 접근
12. ECS Service 업데이트
