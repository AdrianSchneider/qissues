import { assert } from 'chai';
import Comment from '../../../../src/domain/model/comment';
import User from '../../../../src/domain/model/meta/user';

describe('Comment', () => {

  it('Can be serialized', () => {
    const date = new Date();
    const comment = new Comment(
      'cool post',
      <User>{ serialize: () => ({ name: "adrian" }) },
      date
    );

    assert.deepEqual(comment.serialize(), {
      message: 'cool post',
      author: { name: "adrian" },
      date: date.toString()
    });
  });

  it('Can be unserialized', () => {
    const serialized = {
      message: 'hi',
      author: { account: "adrian", name: "" },
      date: new Date().toString()
    };

    const comment = Comment.unserialize(serialized);
    assert.equal(comment.message, 'hi');
    assert.instanceOf(comment.author, User);
    assert.equal(comment.author.account, serialized.author.account);
    assert.instanceOf(comment.date, Date);
    assert.equal(comment.date.toString(), serialized.date);
  });

});
