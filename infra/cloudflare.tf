resource "cloudflare_record" "app" {
  zone_id = var.cloudflare_zone_id
  name    = "@"
  type    = "CNAME"
  content = aws_lb.main.dns_name
  proxied = true
  ttl     = 1
}