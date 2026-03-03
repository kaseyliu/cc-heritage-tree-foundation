"use client";

import React from "react";
import { SignedIn, useUser } from "@clerk/nextjs";
import { Flex, Box, Image, Avatar } from "@chakra-ui/react";
import UserCardPopover from "./UserCardPopUp";
import { isMobile } from "react-device-detect";
import { useState, useEffect } from "react";

interface UserData {
  name: string;
  email: string;
  phoneNumber?: string;
  role: string;
  profileURL?: string;
}

export default function ProfileCard() {
  const { user, isLoaded } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const hasCustomProfileURL = (url?: string) => !!url && url.trim() !== "" && url !== "/pfp.png";
  let role = null;
  if (isLoaded && user) {
    role = user.organizationMemberships?.[0]?.role;
  }

  const isAdmin = role === "org:admin";

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoaded || !user?.primaryEmailAddress?.emailAddress) return;

      try {
        const email = user.primaryEmailAddress.emailAddress;
        const res = await fetch(`/api/user/${email}`);
        const data = await res.json();
        setUserData(data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, [isLoaded, user]);

  useEffect(() => {
    const handleProfilePhotoUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ url?: string }>;
      const newUrl = customEvent.detail?.url;
      if (!newUrl) return;

      setUserData((prev) => ({
        ...(prev || {
          name: "",
          email: "",
          role: "Volunteer",
        }),
        profileURL: newUrl,
      }));
    };

    window.addEventListener("profile-photo-updated", handleProfilePhotoUpdated as EventListener);
    return () => {
      window.removeEventListener("profile-photo-updated", handleProfilePhotoUpdated as EventListener);
    };
  }, []);

  return (
    <SignedIn>
      <Flex
        justify="flex-end"
        gap="4"
        h="100px"
        w="100vw"
        transform={isMobile ? "" : "translate(-15rem)"}
        zIndex={2000}
      >
        <UserCardPopover>
          <Box
            as="div"
            rounded="10"
            padding="20px"
            mt="20px"
            mr="20px"
            bg="white"
            cursor="pointer"
            display="flex"
            alignItems="center"
            gap="5"
          >
            <Avatar
              src={hasCustomProfileURL(userData?.profileURL) ? userData?.profileURL : undefined}
              name={`${user?.firstName || ""} ${user?.lastName || ""}`.trim()}
              boxSize="32px"
            />
            <Flex direction="column">
              <div>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ color: "gray" }}>{isAdmin ? localStorage.getItem("globalUserRole") : "Volunteer"}</div>
            </Flex>
            <Flex gap="4">
              <Image src="/downArrow.svg" alt="Down Arrow" boxSize="24px" />
            </Flex>
          </Box>
        </UserCardPopover>
      </Flex>
    </SignedIn>
  );
}
