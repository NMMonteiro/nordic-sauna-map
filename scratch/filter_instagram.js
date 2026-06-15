fetch('https://api.curator.io/v1/feeds/baf8674c-4952-4fee-8e15-3ed605531af7/posts?limit=100')
  .then(res => res.json())
  .then(data => {
    if (data.posts) {
      const instagramPosts = data.posts.filter(p => p.network_name.toLowerCase() === 'instagram');
      const matching = instagramPosts.filter(p => p.text.toLowerCase().includes('sauna') || p.text.toLowerCase().includes('nordic'));
      console.log(`Total Instagram posts: ${instagramPosts.length}`);
      console.log(`Matching 'sauna' or 'nordic': ${matching.length}`);
      matching.forEach((p, idx) => {
        console.log(`[${idx+1}] Match: ${p.text.substring(0, 150)}...`);
      });
    }
  })
  .catch(err => console.error("Error:", err));
