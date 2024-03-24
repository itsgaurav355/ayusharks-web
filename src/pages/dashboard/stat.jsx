import React from 'react';

function Stat() {
  const stats = [
    { id: 1, name: 'Total investors', value: '44 ' },
    { id: 2, name: 'Total revenue', value: '10 M' },
    { id: 3, name: 'Recent connections', value: '2 K+' },
    { id: 4, name: 'Growth monthly', value: '25%' },

  ];

  return (
    <div className="bg-gray-900 py-4 px-5 flex justify-center items-center rounded-lg shadow-md">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 text-center lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id} className="mx-auto flex flex-col items-center justify-center max-w-xs p-6 bg-blue-500  rounded-lg shadow-lg">
              <dt className="text-base leading-7 text-white">{stat.name}</dt>
              <dd className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export default Stat;
