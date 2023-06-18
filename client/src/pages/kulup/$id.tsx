import { CircularProgress, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingUserInfo from 'src/Loading/LoadingUserInfo';
import CCButton from 'src/components/common/CCButton';
import Image from 'src/components/common/Image';
import { Link } from 'src/components/common/Link';
import Table, {
  announcementColumns,
  eventColumns,
  userColumnsClub,
} from 'src/components/common/Table';
import ContentLayout from 'src/components/layout/ContentLayout';
import { Layout } from 'src/components/layout/Layout';
import { emptyClubData } from 'src/data/emptyData';
import { Routes } from 'src/data/routes';
import { getClubFromIdFetcher, joinClubFetcher } from 'src/fetch/clubFetchers';
import Slides from 'src/slides/Slides';
import { ApprovalStatusEnum, ClubRoleEnum, ClubType } from 'src/types/types';
import { getRemoteImage } from 'src/utils/imageUtils';
import { formatDate, isUserLoggedIn } from 'src/utils/utils';

type CommonProps = {
  club: ClubType;
  loading: boolean;
};

const KulupActionButton = ({ club }: CommonProps) => {
  const [loadingJoin, setLoadingJoin] = useState(false);
  const isUserApproved =
    club.user?.clubJoinApprovalStatus === ApprovalStatusEnum.APPROVED;
  const isUserClubAdmin = club.user?.clubRole === ClubRoleEnum.ADMIN;
  const isLoggedIn = isUserLoggedIn();

  const navigate = useNavigate();

  const handleJoinClub = useCallback(async () => {
    try {
      setLoadingJoin(true);
      const joinResponse = await joinClubFetcher(club.clubId.toString());
      if (joinResponse.status) {
        navigate(0);
      }
    } catch (error) {
      console.error(error);
    }
  }, [club.clubId, navigate]);

  if (isLoggedIn) {
    if (isUserApproved && isUserClubAdmin) {
      return (
        <Stack>
          <CCButton variant="contained">Kulübü Düzenle</CCButton>
        </Stack>
      );
    } else if (
      club.user?.clubJoinApprovalStatus === ApprovalStatusEnum.DECLINED
    ) {
      return (
        <Stack>
          <CCButton disabled>Üyelik başvurunuz reddedildi</CCButton>
        </Stack>
      );
    } else if (
      club.user?.clubJoinApprovalStatus === ApprovalStatusEnum.PENDING
    ) {
      return (
        <Stack>
          <CCButton disabled>Üyelik başvurunuz onay bekliyor</CCButton>
        </Stack>
      );
    } else {
      return (
        <Stack>
          <CCButton
            onClick={handleJoinClub}
            loading={loadingJoin}
            variant="contained"
          >
            Kulübe başvur
          </CCButton>
        </Stack>
      );
    }
  }

  return null;
};

const KulupInfo = ({ club, loading }: CommonProps) => {
  if (loading) {
    return <LoadingUserInfo />;
  }

  return (
    <Stack gap="30px">
      <Stack
        id="upper-content-left"
        justifyContent="center"
        alignItems="center"
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap="30px"
      >
        <Image
          width="150px"
          height="150px"
          src={getRemoteImage(club.image)}
          sx={{
            borderRadius: '20px',
            boxShadow:
              'rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px',
          }}
        />
        <Stack maxWidth="400px" pt={{ xs: '0px', sm: '55px' }}>
          <Typography variant="h4" fontSize={30} color="main" fontWeight={600}>
            {club.name}
          </Typography>
          <Typography variant="h6" color="secondary">
            @{club.clubId}
          </Typography>
          <Typography variant="h6">{club.description}</Typography>
        </Stack>
      </Stack>
      <KulupActionButton club={club} loading={loading} />
    </Stack>
  );
};

const KulupOtherInfo = ({ club, loading }: CommonProps) => {
  if (loading) {
    return <CircularProgress />;
  }

  const advisor = club.advisor;

  return (
    <Stack
      id="upper-content-right"
      justifyContent="center"
      gap="6px"
      sx={{
        backgroundColor: '#00AF8E',
        borderRadius: '20px',
        p: '20px',
        color: '#ffffff',
      }}
    >
      <Link to={`${Routes.ADVISOR}/${advisor.userId}`}>
        <Stack
          flexDirection="row"
          gap="10px"
          alignItems="center"
          justifyContent="center"
          sx={{
            textAlign: 'center',
            backgroundColor: '#6F7788',
            p: '4px',
            borderRadius: '20px',
          }}
        >
          <Typography fontWeight={600}>
            Danışman:
            {advisor.firstName} {advisor.lastName}
          </Typography>
          <Image
            variant="circular"
            src={getRemoteImage(advisor.image)}
            width="30px"
            height="30px"
          />
        </Stack>
      </Link>
      <Typography fontWeight={600}>{club.tag}</Typography>
      <Typography fontWeight={600}>Üye sayısı: {club.users.length}</Typography>
    </Stack>
  );
};

const KulupEtkinlikDuyuru = ({ club, loading }: CommonProps) => {
  const [index, setIndex] = useState(0);

  const events = club.events;
  const announcements = club.announcements;

  return (
    <Stack id="middle-content-left" gap={2}>
      <Stack alignItems="center" alignSelf="flex-start">
        <Tabs value={index} onChange={(e, value) => setIndex(value)}>
          <Tab label="Etkinlikler" value={0} />
          <Tab label="Duyurular" value={1} />
        </Tabs>
      </Stack>
      <Slides index={index}>
        <Table
          loading={loading}
          fullWidth
          title="Etkinlikler"
          data={events.map((event) => ({
            ...event,
            eventDate: formatDate(event.eventDate),
            href: `${Routes.EVENT}/${event.eventId}`,
          }))}
          columns={eventColumns}
        />
        <Table
          loading={loading}
          fullWidth
          title="Duyurular"
          data={announcements.map((announcement) => ({
            ...announcement,
            date: formatDate(announcement.date),
          }))}
          columns={announcementColumns}
        />
      </Slides>
    </Stack>
  );
};

const KulupUyeler = ({ club, loading }: CommonProps) => {
  return (
    <Stack id="middle-content-right">
      <Table
        loading={loading}
        title="Katılımcılar"
        columns={userColumnsClub}
        data={club.users.map((user) => ({
          bolum: user.department.name,
          image: getRemoteImage(user.image),
          name: user.firstName + ' ' + user.lastName,
          href: `${Routes.USER}/${user.userId}`,
          role: user.clubRole === ClubRoleEnum.ADMIN ? 'Yönetici' : 'Üye',
        }))}
      />
    </Stack>
  );
};

const Kulup = () => {
  const { id } = useParams();
  const [club, setClub] = useState<ClubType>(emptyClubData);
  const [loading, setLoading] = useState(true);

  const getClubInfo = useCallback(async () => {
    try {
      if (!id) return;
      const clubResponse = await getClubFromIdFetcher(id);
      if (clubResponse.status) {
        setClub(clubResponse.data);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  }, [id]);

  useEffect(() => {
    getClubInfo();
  }, [getClubInfo]);

  return (
    <Layout>
      <ContentLayout
        upperBackgroundImage={getRemoteImage(club.image)}
        upperLeft={<KulupInfo club={club} loading={loading} />}
        upperRight={<KulupOtherInfo club={club} loading={loading} />}
        middleLeft={<KulupEtkinlikDuyuru club={club} loading={loading} />}
        middleRight={<KulupUyeler club={club} loading={loading} />}
      />
    </Layout>
  );
};

export default Kulup;
