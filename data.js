const rawData = {
  answers: {
    mr: {
      "036": "co-operation is the force"
    }
  }
};

const CARDS = Object.entries(rawData.answers?.mr || {}).map(([id, answer]) => ({
  id: `mr-${id}`,
  category: "Monday Review",
  question: `What is answer ${id}?`,
  answer
}));

// Expose both globals for compatibility with browser script tags.
window.data = rawData;
window.CARDS = CARDS;
