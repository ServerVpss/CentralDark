# REFERENCIA - multi-resource-service-creation.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-manage\references\bookings\multi-resource-service-creation.md
**SHA:** 9c9c8b4b54d7cb5a
**Timestamp:** 2026-08-26T18:42:42.765386
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Service Configuration Pattern:**

### Ouro Bruto (primeiros 5000 chars)
```
---
name: "Multi-Resource Service Creation"
description: Creates resource types and individual resources using Resources API. Enables services that require multiple resources (rooms + equipment + staff) with automatic allocation.
---
# Technical Step-by-Step Instructions: Creating Multi-Resource Bookings Services (Rooms, Equipment, Staff) - Real-World, API-First

## Description

Below are the recommended steps to successfully create Wix Bookings services that require multiple resource types (e.g., Room + Equipment + Instructor). This recipe covers the **gaps** in individual API documentation: resource architecture planning, entity relationship patterns, availability dependencies, and real-world coordination challenges that aren't clear from reading individual API references.


---

## Prerequisites

### Required App Installations

Before creating multi-resource services, ensure the following requirements are met:

1. **Wix Bookings** - Core app must be installed and configured
2. **Premium Plan** - Advanced resource management typically requires premium features
3. **Business Location** - At least one business location must be configured

### App Installation Process

If you encounter resource-related errors, install the required apps using the Apps Installer API.

**For detailed app installation procedures, refer to:**
- [Apps Installer API Documentation](https://dev.wix.com/docs/api-reference/business-management/app-installation/install-app)
- Business setup recipes for comprehensive app installation workflows

## Overview

Multi-resource services allow businesses to create bookings that require multiple types of resources simultaneously. Common examples:
- **Fitness Classes**: Room + Equipment + Instructor
- **Meeting Services**: Conference Room + AV Equipment + Catering Staff
- **Spa Treatments**: Treatment Room + Specialized Equipment + Therapist

The system involves three independent entity types that can be connected:
1. **Resource Types** - Category definitions (Room, Equipment, Staff) - independent entities
2. **Resources** - Individual resource instances with their own schedules and availability - independent entities
3. **Services** - Booking services that can optionally reference resource types - independent entities

**Key Architecture Principle**: Resources and Services are **separate, independent entities**. Resources exist independently but their availability depends on business location hours (for non-staff resources) or working hour schedules (for staff resources). Services can optionally connect to resource types (not individual resources) to require resource allocation during booking, but this connection is loose and flexible.

### CRITICAL API DISCOVERY

**❌ COMMON ARCHITECTURE MISTAKES** (Not Clear in Individual Docs):
- Creating resources without resource types first (creation sequence matters)
- Assuming resources automatically inherit business hours (availability dependency isn't clear)
- Thinking you can connect same resource to conflicting schedules

**✅ CORRECT RESOURCE ARCHITECTURE**:
- **Independent Creation**: Resource Types → Resources (both exist independently)
- **Optional Service Connection**: Services can reference resource types when resource allocation is needed
- **Loose Coupling**: Resources maintain their own schedules and availability regardless of service connections
- **Type-Based References**: Services connect to `resourceType.id`, not individual resource IDs
- **Resource Autonomy**: Resources function independently - services simply request allocation from available resources of specified types

### Key Discovery: Resource Schedule Behavior

**Resource Availability Behavior:**
- Each resource automatically gets a dedicated `eventsSchedule` for tracking bookings
- **Non-staff resources**: Availability depends on business location hours (not 24/7)
- **Staff resources**: Have working hour schedules in addition to event schedules
- **Working hours override**: When `workingHoursSchedules` is configured, it takes precedence over location hours

**Schedule Sharing Patterns:**
- `shared: false` = Dedicated schedule per resource (recommended for most cases)
- `shared: true` = Multiple resources use same working hours schedule
- Business schedule is always `shared: true` among staff

### Key Discovery: Service-Resource Connection Pattern

**Service Configuration Pattern:**
```json
"serviceResources": [
  {"resourceType": {"id": "room-type-id"}},
  {"resourceType": {"id": "equipment-type-id"}},
  {"resourceType": {"id": "staff-type-id"}}
]
```
**Critical**: Services specify resource **types**, not individual resources. This creates a **loose coupling** where:
- Resources exist independently but availability follows business location hours (non-staff) or working hours (staff)
- Services request allocation from available resources of specified types during booking
- No direct binding between individual resources and services
- Resource management (updates, working hours) is 
```