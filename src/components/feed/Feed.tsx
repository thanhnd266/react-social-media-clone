import { Box } from '@mui/system';
import React, { useEffect } from 'react';
import { useAppSelector } from '@base/store';
import PostCard from '@components/feed/Post';
import Share from '@components/feed/Share';
import { selectRandomPosts } from '@helpers/selectors/APIRequestSelector';
import axios from 'axios';
import axiosClient from '@base/config/axios';

export default function Feed() {
  const posts = useAppSelector(selectRandomPosts);

  
  useEffect(() => {
    const getListPost = async () => {
      try {
        const res = await axiosClient.get("https://try.nodebb.org/api/recent/posts");
  
        console.log(res);
      } catch(err) {
        console.log(err);
      }
    }
    getListPost();
  }, [])

  return posts ? (
    <Box
      display="flex"
      flexDirection="column"
      p={3}
      className="w-full"
    >
      <Share />

      {posts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          index={index}
        />
      ))}
    </Box>
  ) : null;
}
