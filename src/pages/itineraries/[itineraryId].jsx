import { useRouter } from "next/router";

export default function Itinerary() {
  const route = useRouter();
  const { itineraryId } = route.query;
  return (
    <>
      <div>Itinerary {itineraryId}</div>
      <div>Welcome</div>
    </>
  );
}
