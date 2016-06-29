import Str from 'Str';
import _ from 'underscore';
import MessageProvider from './providers/MessageProvider.es6';

class MessageBag extends MessageProvider {

  /**
   * Create a new message bag instance.
   *
   * @param  object  $messages
   * @return void
   */
  constructor(messages = {}) {
    super();

    this.$messages = {};

    this.format = ':message';

    _.each(messages, (message, key) => {
      this.$messages[key] =  _.isArray(message) ? message : [message];
    });
  }

  /**
   * Get the keys present in the message bag.
   *
   * @return array
   */
  keys() {
    return _.keys(this.$messages);
  }

  /**
   * Add a message to the bag.
   *
   * @param  string  $key
   * @param  string  $message
   * @return this
   */
  add(key, message) {
    if (this.isUnique(key, message)) {
      this.$messages[key].push(message);
    }

    return this;
  }

  /**
   * Merge a new array of messages into the bag.
   *
   * @param  MessageProvider|object  $messages
   * @return this
   */
  merge(messages) {
    if (messages instanceof MessageBag) {
      messages = messages.getMessageBag().getMessages();
    }

    let keys = _.keys(messages);

    _.each(keys, (key) => {
      if (this.has(key)) {
        if (_.isArray(messages[key])) {
          this.$messages = _.extend({}, this.$messages, {
            [key]: [
              ...this.$messages[key],
              ...messages[key]
            ]
          });
        } else {
          this.$messages = _.extend({}, this.$messages, {
            [key]: [
              ...this.$messages[key],
              messages[key]
            ]
          });
        }
      } else {
        if (_.isArray(messages[key])) {
          this.$messages = _.extend({}, this.$messages, {
            [key]: messages[key]
          });
        } else {
          this.$messages = _.extend({}, this.$messages, {
            [key]: [messages[key]]
          });
        }
      }
    });

    return this;
  }

  /**
   * Determine if a key and message combination already exists.
   *
   * @param  string  $key
   * @param  string  $message
   * @return bool
   */
  isUnique(key, message) {
    return ! _.has(key, this.$messages);
  }

  /**
   * Determine if messages exist for a given key.
   *
   * @param  string  $key
   * @return bool
   */
  has(key = null) {
    return this.first(key) !== '';
  }

  /**
   * Get the first message from the bag for a given key.
   *
   * @param  string  $key
   * @param  string  $format
   * @return string
   */
  first(key = null, format = null) {
    let messages = _.isNull(key) ? this.all(format) : this.get(key, format);

    return messages.length > 0 ? _.first(messages) : '';
  }

  /**
   * Get all of the messages from the bag for a given key.
   *
   * @param  string  $key
   * @param  string  $format
   * @return array|object
   */
  get(key, format = null) {
    if (_.isArray(this.$messages[key])) {
      return this.transform(this.$messages[key], this.checkFormat(format), key);
    }

    return [];
  }

  /**
   * Get all of the messages for every key in the bag.
   *
   * @param  string  $format
   * @return object
   */
  all(format = null) {
    format = this.checkFormat(format);

    let all = {};
    _.each(this.$messages, (message, key) => {
      all[key] = this.transform(message, format, key);
    });

    return all;
  }

  /**
   * Get all of the unique messages for every key in the bag.
   *
   * @param  string  $format
   * @return int
   */
  unique() {
    return new Date().getTime();
  }

  /**
   * Format an object of messages.
   *
   * @param  object   $messages
   * @param  string  $format
   * @param  string  $messageKey
   * @return object
   */
  transform(messages, format, messageKey) {
    let replace = [':message', ':key'], result = [];

    _.each(messages, (message, key) => {
      result[key] = Str.replace(replace, [message, messageKey], format);
    });

    return result;
  }

  /**
   * Get the appropriate format based on the given format.
   *
   * @param  string  $format
   * @return string
   */
  checkFormat(format) {
    return format ? format : this.format;
  }

  /**
   * Get the raw messages in the container.
   *
   * @return object
   */
  messages() {
    return this.$messages;
  }

  /**
   * Get the raw messages in the container.
   *
   * @return object
   */
  getMessages() {
    return this.messages();
  }

  /**
   * Get the messages for the instance.
   *
   * @return MessageBag
   */
  getMessageBag() {
    return this;
  }

  /**
   * Get the default message format.
   *
   * @return string
   */
  getFormat() {
    return this.format;
  }

  /**
   * Set the default message format.
   *
   * @param  string  $format
   * @return \Illuminate\Support\MessageBag
   */
  setFormat(format = ':message') {
    this.format = format;

    return this;
  }

  /**
   * Determine if the message bag has any messages.
   *
   * @return bool
   */
  isEmpty() {
    return ! this.any();
  }

  /**
   * Determine if the message bag has any messages.
   *
   * @return bool
   */
  any() {
    return this.count() > 0;
  }

  /**
   * Get the number of messages in the container.
   *
   * @return int
   */
  count() {
    return _.keys(this.$messages).length;
  }

  /**
   * Refresh the messages.
   *
   * @param  object messages
   * @return void
   */
  refresh(messages = {}) {
    if (_.keys(messages).length > 0) {
      return this.merge(messages);
    }
  }

  /**
   * Clear all of the messages.
   *
   * @return void
   */
  clear() {
    this.$messages = {};
  }

  /**
   * Get the instance as an array.
   *
   * @return object
   */
  toArray() {
    return this.getMessages();
  }

  /**
   * Convert the object into something JSON serializable.
   *
   * @return object
   */
  jsonSerialize(options = 0) {
    return JSON.stringify(this.$messages, null, options);
  }

  /**
   * Convert the message bag to its string representation.
   *
   * @return string
   */
  toJson() {
    return this.getMessages();
  }
}

export default MessageBag;
