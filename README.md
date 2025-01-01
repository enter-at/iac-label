# iac-label
TypeScript library for generating consistent resource names and tags in cloud infrastructure, designed for use with Infrastructure as Code (IaC).

## Installation
```bash
npm install @enter-at/iac-label
```

## Usage
```typescript
import { Label, Context } from '@enter-at/iac-label';
```

**Creating a Label**
You can create a Label instance by providing the required properties via the `ConstructorProps` interface.

```typescript
const context: Context = {
  project: 'my-project',
  environment: 'dev',
  service: 'my-service',
};

const label = new Label(context);
```

Alias for `new Label()`:
```typescript
const label = Label.from(context);
```

### Usage
**.id**

Returns a unique identifier for the label, derived from the label’s fields.
```typescript
label.id;
// my-project-dev-my-service
```

**.tags**

Returns a collection of tags derived from the label’s fields, including custom tags if provided.
```typescript
label.tags;
// { Project: 'my-project', Environment: 'dev', Service: 'my-service' }
```

**.with**

Returns a unique identifier for the label, with additional fields appended.
```typescript
label.with("foo", "bar");
// my-project-dev-my-service-foo-bar
```

### Advanced Usage
**Custom Delimiters**

By default, the label uses a hyphen (`-`) as a delimiter.
You can specify a custom delimiter when creating a label.
```typescript
const label = Label.from({
  project: 'my-project',
  environment: 'dev',
  service: 'my-service',
  delimiter: ':',
});

label.id;
// my-project:dev:my-service
```

**Inheriting Context**

You can inherit context from an existing label, allowing you to extend or override fields while maintaining consistency.
```typescript
const label = Label.from({
  project: 'my-project',
  environment: 'dev',
  service: 'my-service',
});

const newLabel = Label.from(label, {
  environment: 'prod',
});

newLabel.id;
// my-project-prod-my-service
```

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for feature requests or bug fixes.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

