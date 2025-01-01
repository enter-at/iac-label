import { faker } from "@faker-js/faker";
import { ConstructorProps, Context, Label } from "./Label";

describe("Label", () => {
  describe("accessors", () => {
    it.each`
      name             | value
      ${"name"}        | ${faker.internet.domainWord()}
      ${"namespace"}   | ${faker.string.alphanumeric()}
      ${"environment"} | ${faker.helpers.arrayElement(["test", "dev", "prod"])}
      ${"stage"}       | ${faker.string.alphanumeric()}
      ${"attributes"}  | ${[faker.string.uuid(), faker.string.uuid()]}
    `("should provide read accessor for $name", ({ name, value }) => {
      const label = new Label({
        [name]: value,
      });
      expect(label[name as keyof Label]).toBe(value);
    });
  });

  describe(".from", () => {
    let context: Partial<Context>;

    beforeEach(() => {
      context = {
        team: faker.string.alphanumeric(),
        app: faker.string.alphanumeric(),
        stage: faker.string.alphanumeric(),
        environment: faker.string.alphanumeric(),
      };
    });

    it("should return an instance of Label", () => {
      const label = Label.from(context);
      expect(label).toBeInstanceOf(Label);
    });

    describe("with additional props", () => {
      it("should assign additional props", () => {
        const props: ConstructorProps = {
          name: faker.internet.domainWord(),
          namespace: faker.string.alphanumeric(),
        };
        const label = Label.from(context, props);
        expect(label.name).toEqual(props.name);
        expect(label.namespace).toEqual(props.namespace);
      });
    });

    describe("from label", () => {
      it("should inherit from label context", () => {
        const labelOne = Label.from(context);
        const labelTwo = Label.from(labelOne);
        expect(labelTwo.context).toStrictEqual(labelOne.context);
      });
    });
  });

  describe("#id", () => {
    it("should concatenate by {namespace}-{stage}-{name}-{attributes}", () => {
      const props: ConstructorProps = {
        name: faker.internet.domainWord(),
        namespace: faker.string.alphanumeric(),
        environment: faker.helpers.arrayElement(["test", "dev", "prod"]),
        stage: faker.string.alphanumeric(),
        attributes: [faker.string.uuid(), faker.string.uuid()],
      };
      const label = new Label(props);
      const expected = [
        props.namespace,
        props.stage,
        props.name,
        ...(props.attributes ?? []),
      ].join("-");
      expect(label.id).toBe(expected);
    });
    it("should concatenate by {namespace}-{name}-{attributes}", () => {
      const props: ConstructorProps = {
        name: faker.internet.domainWord(),
        namespace: faker.string.alphanumeric(),
        environment: faker.helpers.arrayElement(["test", "dev", "prod"]),
        attributes: [faker.string.uuid(), faker.string.uuid()],
      };
      const label = new Label(props);
      const expected = [
        props.namespace,
        props.name,
        ...(props.attributes ?? []),
      ].join("-");
      expect(label.id).toBe(expected);
    });
    it("should concatenate with custom delimiter", () => {
      const props: ConstructorProps = {
        name: faker.internet.domainWord(),
        namespace: faker.string.alphanumeric(),
        environment: faker.helpers.arrayElement(["test", "dev", "prod"]),
        delimiter: ".",
      };
      const label = new Label(props);
      const expected = [props.namespace, props.name].join(".");
      expect(label.id).toBe(expected);
    });
    it("should sanitize field names", () => {
      const props: ConstructorProps = {
        name: `${faker.internet.domainWord()} ${faker.internet.domainWord()}`,
        namespace: `${faker.string.alphanumeric()}   `,
      };
      const label = new Label(props);
      const expected = [
        props.namespace?.replace(/\s/g, ""),
        props.name?.replace(/\s/g, ""),
      ].join("-");
      expect(label.id).toBe(expected);
    });
  });
  describe("#tags", () => {
    it("should return fields as tags", () => {
      const props: ConstructorProps = {
        name: faker.internet.domainWord(),
        namespace: faker.string.alphanumeric(),
        environment: faker.helpers.arrayElement(["test", "dev", "prod"]),
        stage: faker.string.alphanumeric(),
        attributes: [faker.string.uuid(), faker.string.uuid()],
      };
      const label = new Label(props);
      const expected = {
        Namespace: props.namespace,
        Environment: props.environment,
        Stage: props.stage,
        Name: label.id,
        Attributes: props.attributes?.join("-"),
      };
      expect(label.tags).toStrictEqual(expected as Record<string, string>);
    });
    describe("with custom tags", () => {
      it("should return fields as tags plus custom tags", () => {
        const props: ConstructorProps = {
          name: faker.internet.domainWord(),
          namespace: faker.string.alphanumeric(),
          tags: {
            Type: faker.database.type(),
            Engine: faker.database.engine(),
          },
        };
        const label = new Label(props);
        const expected = {
          Namespace: props.namespace,
          Name: label.id,
          Type: props.tags?.Type,
          Engine: props.tags?.Engine,
        };
        expect(label.tags).toStrictEqual(expected as Record<string, string>);
      });
    });
  });
  describe("#context", () => {
    it("should return a context object", () => {
      const props: ConstructorProps = {
        name: faker.internet.domainWord(),
        namespace: faker.string.alphanumeric(),
        environment: faker.helpers.arrayElement(["test", "dev", "prod"]),
        stage: faker.string.alphanumeric(),
        attributes: [faker.string.uuid(), faker.string.uuid()],
        tags: { Engine: faker.database.engine() },
      };
      const label = new Label(props);
      const expected = {
        ...props,
        delimiter: "-",
      };
      expect(label.context).toStrictEqual(expected);
    });
  });
  describe("construct with context", () => {
    it("should inherit from context object", () => {
      const labelOneProps: ConstructorProps = {
        name: faker.internet.domainWord(),
        namespace: faker.string.alphanumeric(),
        environment: faker.helpers.arrayElement(["test", "dev", "prod"]),
        stage: faker.string.alphanumeric(),
        attributes: [faker.string.uuid(), faker.string.uuid()],
        tags: { Engine: faker.database.engine() },
      };
      const labelTwoProps: ConstructorProps = {
        name: faker.internet.domainWord(),
        tags: { Type: faker.database.type() },
        delimiter: ":",
      };
      const labelThreeProps: ConstructorProps = {
        name: faker.internet.domainWord(),
        stage: faker.string.alphanumeric(),
        tags: { Collation: faker.database.collation() },
      };
      const labelOne = new Label(labelOneProps);
      const labelTwo = new Label({
        ...labelTwoProps,
        context: labelOne.context,
      });
      const labelThree = new Label({
        ...labelThreeProps,
        context: labelTwo.context,
      });

      const expected = {
        ...labelOneProps,
        ...labelTwoProps,
        ...labelThreeProps,
        tags: {
          ...labelOneProps.tags,
          ...labelTwoProps.tags,
          ...labelThreeProps.tags,
        },
      };
      expect(labelThree.context).toStrictEqual(expected);
    });
  });
});
