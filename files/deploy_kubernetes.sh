#!/bin/bash
set -e # ensure that this script will return a non-0 status code if any of rhe commands fail
set -o pipefail # ensure that this script will return a non-0 status code if any of rhe commands fail

VERSION=$1

cat << EOF > service.yaml

---
apiVersion: v1
kind: Service
metadata:
  name: service-api
spec:
  selector:
    app: service-api
  ports:
    - port: 8080
      name: 'application'

---
apiVersion: extensions/v1beta1
kind: Deployment

metadata:
  name: service-api
  labels:
    imageTag: '$VERSION'
spec:
  revisionHistoryLimit: 15
  replicas: $REPLICAS
  strategy:
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  template:
    metadata:
      labels:
        app: service-api
    spec:
      containers:
      - name: service-api
        image: gcr.io/$GCP_PROJECT/service/api:$VERSION
        env:
          - name: PORT
            value: 8080
          - name: ENVIRONMENT
            value: $ENVIRONMENT
          - name: LOG_LEVEL
            value: $LOG_LEVEL
          - name: SCHEDULE_ENABLE
            value: '$SCHEDULE_ENABLE'
          - name: SCHEDULE_GAMES_CRON
            value: '$SCHEDULE_GAMES_CRON'
        ports:
          - containerPort: 8080
        readinessProbe:
          httpGet:
            path: /healthcheck
            port: 8080
          initialDelaySeconds: 15
          timeoutSeconds: 1
          periodSeconds: 5
          failureThreshold: 1
        livenessProbe:
          httpGet:
            path: /healthcheck
            port: 8080
          initialDelaySeconds: 15
          periodSeconds: 15
          timeoutSeconds: 5
          failureThreshold: 4
        resources:
          limits:
            memory: 1500Mi
          requests:
            memory: 1500Mi

EOF
cat service.yaml
kubectl apply -f service.yaml
