const crypto = require('crypto');

// Simulated MongoDB collection: a module-level array acting as the single
// in-memory "table." Node caches modules, so this array is a de facto
// singleton shared by every controller that requires this file.
//
// The method names/shapes (create, find, findById, clear) deliberately
// mirror how a Mongoose model would be called from a controller. That is
// the point: swapping this file for a real Mongoose model later requires
// no changes anywhere else in the app. See DECISIONS.md.
let feedbackCollection = [];

async function create(document) {
  const record = {
    _id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...document,
  };
  feedbackCollection.push(record);
  return record;
}

async function insertMany(documents) {
  const records = documents.map((doc) => ({
    _id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...doc,
  }));
  feedbackCollection.push(...records);
  return records;
}

async function findAll() {
  // Return a shallow copy so callers can't mutate the store directly.
  return [...feedbackCollection];
}

async function findById(id) {
  return feedbackCollection.find((doc) => doc._id === id) ?? null;
}

async function clear() {
  feedbackCollection = [];
}

async function count() {
  return feedbackCollection.length;
}

module.exports = {
  create,
  insertMany,
  findAll,
  findById,
  clear,
  count,
};
