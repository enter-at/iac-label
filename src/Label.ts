export type Tags = Record<string, string>;

class TagCollection {
  private tags: Tags = {};

  static from(tags?: Tags): Tags {
    return new TagCollection(tags).entries;
  }

  constructor(tags?: Tags) {
    if (tags) {
      this.addAll(tags);
    }
  }

  public addAll(tags: Tags): void {
    Object.keys(tags).forEach((key) => {
      this.add(key, tags[key]);
    });
  }

  public add(key: string, value: string): void {
    this.tags[this.titleCase(key)] = value;
  }

  public get entries(): Tags {
    return this.tags;
  }

  private titleCase(key: string): string {
    return key
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
}

export interface Context extends Record<string, unknown> {
  readonly name?: string;
  readonly namespace?: string;
  readonly environment?: string;
  readonly stage?: string;
  readonly attributes?: string[];
  readonly tags?: Tags;
  readonly delimiter?: string;
}

export interface ConstructorProps extends Context {
  context?: Context;
}

export class Label {
  /**
   * The name of the deployment
   * @example "my-app"
   */
  readonly name?: string;

  /**
   * The namespace of the deployment
   * @example "my-company"
   */
  readonly namespace?: string;

  /**
   * The deployment environment
   * @example "prod"
   * @example "dev"
   */
  readonly environment?: string;

  /**
   * The deployment stage
   */
  readonly stage?: string;

  /**
   * Additional fields to be included in the label
   */
  readonly attributes?: string[];

  /**
   * Delimiter used to separate fields in the label
   * @default "-"
   * @example "namespace-stage-name"
   */
  readonly delimiter: string;

  /**
   * Returns a label with default tags assigned
   * @param context
   * @param props
   * @returns Label
   */
  static from(
    context: Partial<Context> | Label,
    props?: Partial<ConstructorProps>
  ): Label {
    return new Label({
      ...props,
      ...(context?.context ?? context),
      tags: TagCollection.from(props?.tags),
    });
  }

  constructor(private props: ConstructorProps) {
    this.name = props.name ?? props.context?.name;
    this.namespace = props.namespace ?? props.context?.namespace;
    this.environment = props.environment ?? props.context?.environment;
    this.stage = props.stage ?? props.context?.stage;
    this.attributes = props.attributes ?? props.context?.attributes;
    this.delimiter = props.delimiter ?? props.context?.delimiter ?? "-";
  }

  public get context(): Context {
    return {
      name: this.name,
      namespace: this.namespace,
      environment: this.environment,
      stage: this.stage,
      attributes: this.attributes,
      tags: { ...this.props.tags, ...this.props.context?.tags },
      delimiter: this.delimiter,
    };
  }

  public get id(): string {
    return [this.namespace, this.stage, this.name, ...(this.attributes ?? [])]
      .filter((value) => value !== undefined)
      .map((value) => value?.replace(/\s/g, ""))
      .join(this.delimiter);
  }

  public with(...token: string[]): string {
    return [this.id, ...token].join(this.delimiter);
  }

  public get tags(): Tags {
    return {
      ...this.props.tags,
      ...this.props.context?.tags,
      ...this.fieldsAsTags(),
    };
  }

  private fieldsAsTags(): Tags {
    const tags = new TagCollection({
      name: this.id,
    });

    for (const field of ["namespace", "environment", "stage"]) {
      const value = this[field as keyof Label];
      if (value !== undefined) {
        tags.add(field, value as keyof Tags);
      }
    }

    if (this.attributes) {
      tags.add("attributes", this.attributes.join(this.delimiter));
    }

    return tags.entries;
  }
}
