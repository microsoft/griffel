export async function lazy() {
  const styles1 = await import(/* webpackChunkName: "chunk1" */ './chunk1');
  const styles2 = await import(/* webpackChunkName: "chunk2" */ './chunk2');

  return [styles1, styles2];
}
