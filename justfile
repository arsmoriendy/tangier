version := `cat package.json | jq -r '.version'`

build-img-as-latest: build-img
    docker tag tangier:{{ version }} tangier

build-img:
    docker build . -t tangier:{{ version }}

save parent-path=".":
    docker save tangier:{{ version }} | xz > {{ parent-path }}/tangier-{{ version }}.img.tar.xz
