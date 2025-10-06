# Monitoring and Metrics

This document describes the monitoring and metrics capabilities of the SOS Tourist Doctor API.

## Overview

The application includes comprehensive monitoring and metrics collection features to help you understand the performance and health of your application in production.

## Health Checks

The API provides several health check endpoints:

### Basic Health Check
```
GET /v1/health
```
Returns basic health information about the application including uptime, environment, and service status.

### Detailed Health Check
```
GET /v1/health/details
```
Returns detailed health information including memory usage, database status, real-time service status, and application metrics.

### Database Health Check
```
GET /v1/health/database
```
Returns detailed information about database connectivity and health.

### Database Statistics
```
GET /v1/health/database/stats
```
Returns database statistics and performance metrics.

### Liveness Probe
```
GET /v1/health/live
```
Kubernetes-style liveness probe endpoint. Returns 200 OK if the application is running.

### Readiness Probe
```
GET /v1/health/ready
```
Kubernetes-style readiness probe endpoint. Returns 200 OK if the application is ready to serve requests.

## Metrics Collection

The application collects various metrics to help monitor performance and usage:

### API Request Metrics
- Total requests
- Requests by HTTP method
- Requests by response status code
- Average response time

### Database Metrics
- Total queries
- Query errors
- Average query time

### User Metrics
- Total users
- Active sessions
- Users by role

### Error Metrics
- Total errors
- Errors by type

### Accessing Metrics
```
GET /v1/health/metrics
```
Returns all collected metrics in JSON format.

## Performance Monitoring

The application automatically monitors response times and logs slow requests (> 1 second). Response times are also included in the `X-Response-Time` header for all responses.

## Structured Logging

The application uses structured logging with Winston to provide detailed logs that can be easily parsed and analyzed. In production, logs are written to files in the `logs/` directory.

Log levels:
- error: Runtime errors and exceptions
- warn: Warning conditions
- info: Informational messages
- debug: Debug-level messages (development only)

## Setting up External Monitoring

To set up external monitoring, you can:

1. Use the health check endpoints with your monitoring solution (e.g., Prometheus, Datadog, New Relic)
2. Parse the metrics endpoint to collect custom metrics
3. Configure log forwarding to your centralized logging solution

## Alerting

Consider setting up alerts for the following conditions:
- Health check endpoint returns non-200 status
- High error rate (> 5% of requests)
- High response times (> 1 second average)
- High memory usage (> 80% of available memory)
- Database connectivity issues

## Performance Optimization Tips

1. Monitor the metrics endpoint regularly to identify performance trends
2. Use the detailed health endpoint to identify resource bottlenecks
3. Set up alerts for slow requests to identify performance issues early
4. Regularly review logs for error patterns