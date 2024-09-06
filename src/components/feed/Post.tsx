import { MoreVert } from '@mui/icons-material';
import { Box } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import moment from "moment";

interface PostProps {
  post: any;
  index: number;
}

export default function PostCard({ post, index }: PostProps) {
  const { t } = useTranslation();
  return (
    <Box
      p={3}
      className="w-full rounded-xl shadow-card mx-0 my-8"
    >
      <Box className="flex items-center justify-between cursor-pointer">
        <Box className="flex align-center">
          <img
            loading={`${index === 0 ? 'eager' : 'lazy'}`}
            src={"https://static.vecteezy.com/system/resources/previews/013/042/571/original/default-avatar-profile-icon-social-media-user-photo-in-flat-style-vector.jpg"}
            referrerPolicy="no-referrer"
            width="100%"
            height="100%"
            className="w-9 h-9 rounded-full object-cover"
            alt={`${t('a11y.postOwnerImage')}-${post?.user?.displayname} ${post?.uid}`}
          />

          <figcaption className="text-base font-bold my-0 mx-2.5 flex items-center">{`${post?.user?.displayname}`}</figcaption>

          <time className="text-zinc-500	text-xs flex items-center">
            {moment().format("DD/MM/YYYY")}
          </time>
        </Box>

        <MoreVert />
      </Box>

      <Box
        mx={0}
        my={5}
      >
        <figcaption>{post.title}</figcaption>

        {post.image ? (
          <img
            loading={`${index === 0 ? 'eager' : 'lazy'}`}
            src={post.image}
            width="100%"
            height="100%"
            aria-label={t('a11y.postImage')}
            className="mt-5 w-full max-h-[112rem] object-contain"
            alt={t('a11y.postImage')}
          />
        ) : null}
      </Box>

      <Box className="flex items-center justify-between">
        <Box className="flex items-center">
          <img
            loading="lazy"
            className="w-6 h-6 mr-1.5 cursor-pointer"
            width="100%"
            height="100%"
            src="/assets/like.png"
            aria-label={t('a11y.likePost')}
            alt={t('a11y.likePost')}
          />

          <img
            loading="lazy"
            className="w-6 h-6 mr-2.5 cursor-pointer"
            width="100%"
            height="100%"
            src="/assets/heart.png"
            aria-label={t('a11y.favoritePost')}
            alt={t('a11y.favoritePost')}
          />

          <p className="text-sm">
            {post.upvotes} <u>{t('components.post.people')}</u> {t('components.post.likeThis')}
          </p>
        </Box>

        <p className="cursor-pointer text-sm">
          {post.upvotes} {t('components.post.comments')}
        </p>
      </Box>
    </Box>
  );
}
