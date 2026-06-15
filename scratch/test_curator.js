fetch('https://api.curator.io/v1/feeds/baf8674c-4952-4fee-8e15-3ed605531af7/posts?limit=100')
  .then(res => res.json())
  .then(data => {
    console.log("Total posts found:", data.posts ? data.posts.length : 0);
    if (data.posts) {
      const networks = new Set(data.posts.map(p => p.network_name));
      console.log("Networks represented in feed:", Array.from(networks));
      console.log("Sample post data keys:", Object.keys(data.posts[0] || {}));
      console.log("Sample network posts count:", data.posts.reduce((acc, p) => {
        acc[p.network_name] = (acc[p.network_name] || 0) + 1;
        return acc;
      }, {}));
    }
  })
  .catch(err => console.error("Error:", err));
