import { Stack, Typography } from '@mui/material';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LoadingUserInfo from 'src/Loading/LoadingUserInfo';
import Image from 'src/components/common/Image';
import Table, { Column } from 'src/components/common/Table';
import ContentLayout from 'src/components/layout/ContentLayout';
import { Layout } from 'src/components/layout/Layout';
import { emptyUserData } from 'src/data/emptyData';
import { Routes } from 'src/data/routes';
import { getUserFromIdFetcher } from 'src/fetch/userFetchers';
import { ClubBaseType, EventBaseType, UserType } from 'src/types/types';
import { getRemoteImage } from 'src/utils/imageUtils';
import { formatDate } from 'src/utils/utils';

const etkinlikColumns: Column<EventBaseType>[] = [
  { header: ' ', accessor: 'image', align: 'center' },
  { header: 'Etkinlik Adı', accessor: 'name' },
  { header: 'Tarih', accessor: 'eventDate', align: 'center' },
  { header: 'Yer', accessor: 'location', align: 'center' },
];

const kulupColumns: Column<ClubBaseType>[] = [
  { header: ' ', accessor: 'image', align: 'center' },
  { header: 'Kulüp Adı', accessor: 'name' },
  { header: 'Kulüp Açıklaması', accessor: 'description' },
];

type UserProps = {
  user: UserType;
  loading: boolean;
};

const UyeInfo = ({ user, loading }: UserProps) => {
  if (loading) {
    return <LoadingUserInfo />;
  }

  return (
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
        src={getRemoteImage(user.image)}
        sx={{
          borderRadius: '20px',
          boxShadow:
            'rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px',
        }}
      />
      <Stack maxWidth="400px" pt={{ xs: '0px', sm: '55px' }}>
        <Typography variant="h4" fontSize={30} color="main" fontWeight={600}>
          {user.firstName} {user.lastName}
        </Typography>
        <Typography variant="h6" color="secondary">
          {user.email}
        </Typography>
        <Typography variant="h6">{user.department.name}</Typography>
      </Stack>
    </Stack>
  );
};

const UyeKulupler = ({ user, loading }: UserProps) => {
  return (
    <Stack id="middle-content-right">
      <Table
        loading={loading}
        title="Kulüp Üyelikleri"
        data={user.clubs.map((club) => ({
          ...club,
          href: `${Routes.KULUP}/${club.clubId}`,
        }))}
        columns={kulupColumns}
      />
    </Stack>
  );
};

const UyeEtkinlikler = ({ user, loading }: UserProps) => {
  return (
    <Stack id="middle-content-right">
      <Table
        loading={loading}
        title="Etkinlik Kayıtları"
        data={user.events.map((event) => ({
          ...event,
          eventDate: formatDate(event.eventDate),
          href: `${Routes.ETKINLIK}/${event.eventId}`,
        }))}
        columns={etkinlikColumns}
      />
    </Stack>
  );
};

const Kullanici = () => {
  const [user, setUser] = useState<UserType>(emptyUserData);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const getUserInfo = useCallback(async () => {
    try {
      if (!id) return;
      setLoading(true);
      const userResponse = await getUserFromIdFetcher(id);
      if (userResponse.status) {
        setUser(userResponse.data);
        setLoading(false);
      }
      console.log(userResponse);
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  useEffect(() => {
    getUserInfo();
  }, [getUserInfo]);

  return (
    <Layout>
      <ContentLayout
        upperLeft={<UyeInfo loading={loading} user={user} />}
        upperRight={<Stack> </Stack>}
        middleLeft={<UyeEtkinlikler loading={loading} user={user} />}
        middleRight={<UyeKulupler loading={loading} user={user} />}
      />
    </Layout>
  );
};

export default Kullanici;
