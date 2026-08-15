# Patterns of Enterprise Application Architecture in Modern .NET

An editorial series translating Martin Fowler's *Patterns of Enterprise Application Architecture* catalog into modern .NET 10 and C# 14 examples.

## Series structure

The collection contains **4 introductory articles + 51 pattern articles = 55 articles total**.

### Introductory articles

- [01 — 01-what-are-enterprise-application-architecture-patterns](01-what-are-enterprise-application-architecture-patterns.md)
- [02 — 02-layers-boundaries-separation-of-concerns](02-layers-boundaries-separation-of-concerns.md)
- [03 — 03-transaction-script-domain-model-service-layer](03-transaction-script-domain-model-service-layer.md)
- [04 — 04-data-access-patterns-object-relational-mismatch](04-data-access-patterns-object-relational-mismatch.md)

### Pattern articles

#### Domain Logic Patterns

- [05 — Transaction Script](05-transaction-script.md)
- [06 — Domain Model](06-domain-model.md)
- [07 — Table Module](07-table-module.md)
- [08 — Service Layer](08-service-layer.md)
#### Data Source Architectural Patterns

- [09 — Table Data Gateway](09-table-data-gateway.md)
- [10 — Row Data Gateway](10-row-data-gateway.md)
- [11 — Active Record](11-active-record.md)
- [12 — Data Mapper](12-data-mapper.md)
#### Object-Relational Behavioral Patterns

- [13 — Unit of Work](13-unit-of-work.md)
- [14 — Identity Map](14-identity-map.md)
- [15 — Lazy Load](15-lazy-load.md)
#### Object-Relational Structural Patterns

- [16 — Identity Field](16-identity-field.md)
- [17 — Inheritance Mappers](17-inheritance-mappers.md)
- [18 — Foreign Key Mapping](18-foreign-key-mapping.md)
- [19 — Association Table Mapping](19-association-table-mapping.md)
- [20 — Dependent Mapping](20-dependent-mapping.md)
- [21 — Embedded Value](21-embedded-value.md)
- [22 — Serialized LOB](22-serialized-lob.md)
- [23 — Single Table Inheritance](23-single-table-inheritance.md)
- [24 — Class Table Inheritance](24-class-table-inheritance.md)
- [25 — Concrete Table Inheritance](25-concrete-table-inheritance.md)
#### Object-Relational Metadata Mapping Patterns

- [26 — Metadata Mapping](26-metadata-mapping.md)
- [27 — Query Object](27-query-object.md)
- [28 — Repository](28-repository.md)
#### Web Presentation Patterns

- [29 — Model View Controller](29-model-view-controller.md)
- [30 — Page Controller](30-page-controller.md)
- [31 — Front Controller](31-front-controller.md)
- [32 — Template View](32-template-view.md)
- [33 — Transform View](33-transform-view.md)
- [34 — Two Step View](34-two-step-view.md)
- [35 — Application Controller](35-application-controller.md)
#### Distribution Patterns

- [36 — Remote Facade](36-remote-facade.md)
- [37 — Data Transfer Object](37-data-transfer-object.md)
#### Offline Concurrency Patterns

- [38 — Optimistic Offline Lock](38-optimistic-offline-lock.md)
- [39 — Pessimistic Offline Lock](39-pessimistic-offline-lock.md)
- [40 — Coarse-Grained Lock](40-coarse-grained-lock.md)
- [41 — Implicit Lock](41-implicit-lock.md)
#### Session State Patterns

- [42 — Client Session State](42-client-session-state.md)
- [43 — Server Session State](43-server-session-state.md)
- [44 — Database Session State](44-database-session-state.md)
#### Base Patterns

- [45 — Gateway](45-gateway.md)
- [46 — Service Stub](46-service-stub.md)
- [47 — Record Set](47-record-set.md)
- [48 — Mapper](48-mapper.md)
- [49 — Layer Supertype](49-layer-supertype.md)
- [50 — Separated Interface](50-separated-interface.md)
- [51 — Registry](51-registry.md)
- [52 — Value Object in Modern C#](52-value-object.md)
- [53 — Money in Modern C# and .NET](53-money.md)
- [54 — Special Case in Modern C#](54-special-case.md)
- [55 — Plugin](55-plugin.md)

## Editorial conventions

- Markdown with YAML frontmatter.
- `order` is the canonical series order: four introductions followed by Fowler's catalog order.
- Pattern articles include the source catalog URL in `fowler_url`.
- Code targets .NET 10 and C# 14.
- Articles are drafts intended for editorial review before publication.

## Catalog audit

- 51/51 Fowler catalog patterns represented.
- No duplicate pattern articles.
- Fowler's `Record Set` pattern added during the final audit.
- Earlier numbering differences were corrected so the pattern sequence now follows the catalog exactly.
