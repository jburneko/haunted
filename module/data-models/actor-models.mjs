const { HTMLField, FilePathField, NumberField, SchemaField, StringField } =
  foundry.data.fields;

class HauntedDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      notes: new HTMLField({ required: true, blank: true }),
    };
  }
}

class LivingDataModel extends HauntedDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      influence: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0,
      }),
      effort: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0,
      }),
    };
  }
}

export class MurdererDataModel extends LivingDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      ambition: new StringField({ required: true, blank: true }),
    };
  }
}

export class SupportDataModel extends LivingDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      disposition: new NumberField({
        required: true,
        integer: true,
        min: 0,
        max: 5,
        initial: 0,
      }),
    };
  }
}

export class VictimSupportDataModel extends SupportDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      problem: new StringField({ require: true, blank: true }),
    };
  }
}

export class GhostDataModel extends HauntedDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      presence: new SchemaField({
        value: new NumberField({ required: true, integer: true, initial: 0 }),
        max: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 0,
        }),
      }),
      unfinishedBusiness: new StringField({ require: true, blank: true }),
    };
  }
}
