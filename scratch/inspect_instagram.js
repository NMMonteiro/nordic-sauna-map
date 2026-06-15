fetch('https://api.curator.io/v1/feeds/baf8674c-4952-4fee-8e15-3ed605531af7/posts?limit=100')
  .then(res => res.json())
  .then(data => {
    if (data.posts) {
      const instagramPosts = data.posts.filter(p => p.network_name.toLowerCase() === 'instagram');
      console.log("Instagram posts count:", instagramPosts.length);
      const usernames = Array.from(new Set(instagramPosts.map(p => p.user_screen_name)));
      console.log("Unique Instagram usernames:", usernames);
      console.log("Sample Instagram post text snippet:");
      instagramPosts.slice(0, 3).forEach((p, i) => {
        console.log(`Post ${i+1} by ${p.user_screen_name}: ${p.text.substring(0, 100)}...`);
      });
    }
  })
  .catch(err => console.error("Error:", err));
